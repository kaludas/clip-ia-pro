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

Provide a copyright risk assessment with:
1. risk_level: "safe", "low", "medium", "high", "critical"
2. is_copyrighted: boolean
3. can_use: boolean (if it's safe to use on social media)
4. platforms: which platforms allow it (tiktok, youtube, instagram)
5. recommendation: what the user should do
6. alternative_suggestions: suggest 2-3 similar copyright-free alternatives
7. confidence: your confidence level (0-100)

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
            content: 'You are a copyright expert specializing in music licensing for social media. Provide accurate, actionable advice.' 
          },
          { role: 'user', content: prompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'copyright_assessment',
            description: 'Assess copyright risk for audio content',
            parameters: {
              type: 'object',
              properties: {
                risk_level: { 
                  type: 'string', 
                  enum: ['safe', 'low', 'medium', 'high', 'critical'] 
                },
                is_copyrighted: { type: 'boolean' },
                can_use: { type: 'boolean' },
                platforms: { 
                  type: 'array', 
                  items: { 
                    type: 'string',
                    enum: ['tiktok', 'youtube', 'instagram', 'twitter'] 
                  } 
                },
                recommendation: { type: 'string' },
                alternative_suggestions: { 
                  type: 'array',
                  items: { type: 'string' }
                },
                confidence: { type: 'number', minimum: 0, maximum: 100 }
              },
              required: ['risk_level', 'is_copyrighted', 'can_use', 'recommendation', 'confidence'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'copyright_assessment' } }
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
    
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const assessment = JSON.parse(toolCall.function.arguments);
    
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
