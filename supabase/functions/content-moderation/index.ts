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
    const { transcript, videoFrames, platform } = await req.json();
    
    console.log('Moderating content for platform:', platform);

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const platformGuidelines = {
      tiktok: 'TikTok Community Guidelines: No hate speech, violence, dangerous content, illegal activities, sexual content, harmful misinformation',
      youtube: 'YouTube policies: No harassment, spam, harmful content, violent or graphic content, hateful content, copyright violations',
      instagram: 'Instagram Community Guidelines: No bullying, harassment, violence, graphic content, hate speech, regulated goods',
      twitter: 'Twitter Rules: No violence, terrorism, child exploitation, hateful conduct, abusive behavior, private information sharing'
    };

    const prompt = `Analyze this video content for policy violations on ${platform}:

Platform Guidelines: ${platformGuidelines[platform as keyof typeof platformGuidelines] || 'General social media guidelines'}

Transcript:
${transcript || 'No transcript provided'}

Video Frames Data:
${videoFrames ? JSON.stringify(videoFrames.slice(0, 3)) : 'No frames provided'}

Provide a comprehensive moderation assessment with:
1. is_safe: boolean (overall safety)
2. risk_level: "safe", "low", "medium", "high", "critical"
3. violations: array of detected violations with:
   - type: violation category
   - severity: "low", "medium", "high", "critical"
   - timestamp: when it occurs (if known)
   - description: what the issue is
   - suggestion: how to fix it
4. platform_specific: warnings specific to ${platform}
5. monetization_impact: can this affect monetization?
6. recommendations: actionable steps to make content compliant
7. confidence: your confidence level (0-100)

Check for:
- Profanity and offensive language
- Violence and graphic content
- Hate speech and discrimination
- Sexual content
- Misinformation
- Copyright concerns
- Platform-specific violations`;

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
            content: `You are a content moderation expert specializing in ${platform} policies. Be strict but fair in your assessments.` 
          },
          { role: 'user', content: prompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'content_moderation',
            description: 'Assess content for policy violations',
            parameters: {
              type: 'object',
              properties: {
                is_safe: { type: 'boolean' },
                risk_level: { 
                  type: 'string', 
                  enum: ['safe', 'low', 'medium', 'high', 'critical'] 
                },
                violations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      severity: { 
                        type: 'string',
                        enum: ['low', 'medium', 'high', 'critical']
                      },
                      timestamp: { type: 'number' },
                      description: { type: 'string' },
                      suggestion: { type: 'string' }
                    },
                    required: ['type', 'severity', 'description', 'suggestion']
                  }
                },
                platform_specific: { type: 'array', items: { type: 'string' } },
                monetization_impact: { type: 'boolean' },
                recommendations: { type: 'array', items: { type: 'string' } },
                confidence: { type: 'number', minimum: 0, maximum: 100 }
              },
              required: ['is_safe', 'risk_level', 'violations', 'recommendations', 'confidence'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'content_moderation' } }
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
    console.log('AI moderation response received');
    
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const moderation = JSON.parse(toolCall.function.arguments);
    
    console.log('Content moderation result:', moderation);

    return new Response(
      JSON.stringify({ moderation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in content-moderation:', error);
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
