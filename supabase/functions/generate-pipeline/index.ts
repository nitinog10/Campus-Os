import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are the Pipeline Generator for CAMPUSOS. Given a structured intent, you create an execution pipeline.

Your job is to decide:
1. WHAT assets to generate
2. IN WHAT ORDER (dependencies)
3. WHAT TYPE each step is (text, design, code)

PIPELINE RULES:
- Each step should be atomic and clear
- Steps can have dependencies on previous steps
- Text steps should come before design steps that use them
- Code steps usually come last

STEP TYPES:
- text: Headlines, copy, descriptions, content blocks
- design: Color schemes, layout suggestions, visual structure  
- code: HTML/CSS output, component structure

OUTPUT FORMAT (JSON):
{
  "steps": [
    {
      "id": "step_1",
      "name": "Short step name",
      "description": "What this step produces",
      "type": "text" | "design" | "code",
      "dependencies": ["step_id"] // empty array if no dependencies
    }
  ]
}

FOR EVENT PROMOTION:
- Headline copy
- Event details text
- Call-to-action text
- Visual theme suggestion
- Social media post template (code)
- Poster layout (code)

FOR WEBSITE:
- Hero section copy
- Feature descriptions
- About/info section
- Color and typography theme
- Full page HTML/CSS

FOR PRESENTATION:
- Title slide content
- Section outlines
- Key points per section
- Visual theme
- Slide structure (code)

Output valid JSON only. Max 6 steps for MVP.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { intent } = await req.json();

    if (!intent || !intent.type) {
      return new Response(
        JSON.stringify({ error: 'Parsed intent is required' }),
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

    console.log('Generating pipeline for:', intent.type, intent.title);

    const userMessage = `Generate a pipeline for this intent:

Type: ${intent.type}
Title: ${intent.title}
Description: ${intent.description}
Audience: ${intent.audience}
Tone: ${intent.tone}
Required Elements: ${intent.elements.join(', ')}
Context: ${JSON.stringify(intent.context)}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.4,
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

    let pipeline;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                        content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      pipeline = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse pipeline JSON:', content);
      throw new Error('Failed to parse pipeline');
    }

    // Add status to each step
    const stepsWithStatus = pipeline.steps.map((step: any) => ({
      ...step,
      status: 'pending'
    }));

    console.log('Generated pipeline with', stepsWithStatus.length, 'steps');

    return new Response(
      JSON.stringify({ 
        pipeline: {
          id: crypto.randomUUID(),
          intent,
          steps: stepsWithStatus,
          status: 'initializing',
          createdAt: new Date().toISOString()
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('generate-pipeline error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
