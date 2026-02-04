import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const TEXT_PROMPT = `You are a content writer for CAMPUSOS. Generate high-quality text content.

OUTPUT FORMAT (JSON):
{
  "content": "The generated text content",
  "explanation": {
    "rationale": "Why this content was created this way",
    "decisions": ["Key decision 1", "Key decision 2"],
    "alternatives": ["Alternative approach 1"]
  }
}

Be concise, impactful, and appropriate for the target audience and tone.
Output valid JSON only.`;

const DESIGN_PROMPT = `You are a design advisor for CAMPUSOS. Suggest visual design elements.

OUTPUT FORMAT (JSON):
{
  "content": "Detailed design description and suggestions",
  "metadata": {
    "colors": ["#hex1", "#hex2"],
    "typography": "Font suggestions",
    "layout": "Layout approach"
  },
  "explanation": {
    "rationale": "Why these design choices",
    "decisions": ["Design decision 1", "Design decision 2"],
    "alternatives": ["Alternative style"]
  }
}

Consider modern design trends, accessibility, and the target audience.
Output valid JSON only.`;

const CODE_PROMPT = `You are a frontend developer for CAMPUSOS. Generate clean HTML/CSS code.

OUTPUT FORMAT (JSON):
{
  "content": "<!DOCTYPE html>...",
  "metadata": {
    "format": "html",
    "language": "html/css"
  },
  "explanation": {
    "rationale": "Why this code structure",
    "decisions": ["Code decision 1", "Code decision 2"],
    "alternatives": ["Alternative implementation"]
  }
}

RULES:
- Use modern, semantic HTML5
- Include embedded CSS (style tag)
- Make it responsive
- Use clean, readable code
- Include comments for key sections

Output valid JSON only. The content field should contain the full HTML document.`;

function getPromptForType(type: string): string {
  switch (type) {
    case 'text': return TEXT_PROMPT;
    case 'design': return DESIGN_PROMPT;
    case 'code': return CODE_PROMPT;
    default: return TEXT_PROMPT;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { step, intent, previousOutputs } = await req.json();

    if (!step || !intent) {
      return new Response(
        JSON.stringify({ error: 'Step and intent are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating asset:', step.name, 'type:', step.type);

    const systemPrompt = getPromptForType(step.type);

    // Build context from previous outputs
    let previousContext = '';
    if (previousOutputs && previousOutputs.length > 0) {
      previousContext = `\n\nPREVIOUS OUTPUTS TO BUILD UPON:\n${previousOutputs.map((o: any) => 
        `- ${o.subtype}: ${o.content.substring(0, 500)}...`
      ).join('\n')}`;
    }

    const userMessage = `Generate content for this step:

STEP: ${step.name}
DESCRIPTION: ${step.description}
TYPE: ${step.type}

INTENT CONTEXT:
- Type: ${intent.type}
- Title: ${intent.title}
- Description: ${intent.description}
- Audience: ${intent.audience}
- Tone: ${intent.tone}
- Elements needed: ${intent.elements.join(', ')}
- Additional context: ${JSON.stringify(intent.context)}${previousContext}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    let assetData;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                        content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      assetData = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse asset JSON:', content);
      // Fallback: treat entire response as content
      assetData = {
        content: content,
        explanation: {
          rationale: 'Generated based on the provided context',
          decisions: ['Direct content generation'],
          alternatives: []
        }
      };
    }

    const asset = {
      id: crypto.randomUUID(),
      type: step.type,
      subtype: step.name,
      content: assetData.content,
      metadata: assetData.metadata || {},
      explanation: assetData.explanation || {
        rationale: 'Generated based on intent',
        decisions: [],
        alternatives: []
      }
    };

    console.log('Generated asset:', asset.id, asset.subtype);

    return new Response(
      JSON.stringify({ asset }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('generate-asset error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
