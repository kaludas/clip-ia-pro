import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioTitle, audioArtist, audioUrl } = await req.json();
    
    console.log('Checking copyright for:', { audioTitle, audioArtist });

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `Analyze if this audio might have copyright issues for use in social media content:
    
Title: ${audioTitle || 'Unknown'}
Artist: ${audioArtist || 'Unknown'}
URL: ${audioUrl || 'Not provided'}

You MUST respond with a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "risk_level": "safe" | "low" | "medium" | "high" | "critical",
  "is_copyrighted": boolean,
  "can_use": boolean,
  "platforms": ["tiktok", "youtube", "instagram", "twitter"],
  "recommendation": "string explaining what to do",
  "alternative_suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "confidence": number between 0-100
}

Consider:
- DMCA databases
- Popular copyrighted music
- Royalty-free music libraries
- Platform-specific music libraries
- Fair use considerations`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are a copyright expert. Always respond with valid JSON only, no markdown formatting.' 
          },
          { role: 'user', content: prompt }
        ]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI quota exceeded. Please add credits to your workspace.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');
    
    let content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const assessment = JSON.parse(content);
    console.log('Copyright assessment:', assessment);

    return new Response(
      JSON.stringify({ assessment }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in copyright-checker:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
