import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are the Intent Interpreter for CAMPUSOS, an AI orchestration platform for college students.

Your job is to analyze user input and extract structured intent data. Users express WHAT they want, not HOW to build it.

SUPPORTED INTENT TYPES:
1. event_promotion - College events, club activities, hackathons, fests, workshops
2. website - Landing pages, portfolios, project showcases, club websites
3. presentation - Assignments, project reports, pitch decks, slideshows

ANALYSIS RULES:
- Identify the core intent type
- Extract title and description
- Determine target audience
- Infer appropriate tone (formal/casual/energetic/professional)
- List required elements/components
- Extract any contextual information (dates, venues, themes, etc.)

OUTPUT FORMAT (JSON):
{
  "type": "event_promotion" | "website" | "presentation",
  "title": "string",
  "description": "string", 
  "audience": "string",
  "tone": "formal" | "casual" | "energetic" | "professional",
  "elements": ["string"],
  "context": { "key": "value" }
}

Be precise. If information is missing, make reasonable assumptions based on context.
Always output valid JSON only.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userInput } = await req.json();

    if (!userInput || typeof userInput !== 'string') {
      return new Response(
        JSON.stringify({ error: 'User input is required' }),
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

    console.log('Interpreting intent for:', userInput.substring(0, 100));

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
          { role: 'user', content: userInput }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }),
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

    // Parse JSON from response (handle potential markdown wrapping)
    let parsedIntent;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                        content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsedIntent = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse intent JSON:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log('Parsed intent:', parsedIntent.type, parsedIntent.title);

    return new Response(
      JSON.stringify({ intent: parsedIntent }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('interpret-intent error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
