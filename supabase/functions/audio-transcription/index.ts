import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio, language = 'fr', format = 'webm' } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log('Processing audio transcription with Lovable AI...');
    console.log('Language:', language);
    console.log('Format:', format);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Use Gemini 2.5 Flash for audio transcription
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
            content: `You are a professional audio transcription assistant. Transcribe the audio content accurately in ${language}. Format your response as a JSON object with this structure:
{
  "text": "full transcription",
  "segments": [
    {"start": 0, "end": 5, "text": "segment text"},
    ...
  ]
}

Create segments of approximately 3-5 seconds each. Estimate timing based on speech pace. Return ONLY the JSON, no other text.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please transcribe this audio file:'
              },
              {
                type: 'audio',
                audio: {
                  data: audio,
                  format: format
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add credits to your Lovable AI workspace.');
      }
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`Transcription failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    let result;
    try {
      const content = data.choices[0].message.content;
      
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create basic structure if AI didn't return JSON
        result = {
          text: content,
          segments: []
        };
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Create basic structure from raw text
      const text = data.choices[0].message.content;
      result = {
        text: text,
        segments: []
      };
    }

    // If no segments provided, create basic segments (one per sentence)
    if (!result.segments || result.segments.length === 0) {
      const sentences = result.text.split(/[.!?]+/).filter((s: string) => s.trim());
      const avgDuration = 5; // Estimate 5 seconds per sentence
      result.segments = sentences.map((sentence: string, index: number) => ({
        start: index * avgDuration,
        end: (index + 1) * avgDuration,
        text: sentence.trim()
      }));
    }

    console.log(`Transcription successful: ${result.segments.length} segments`);

    return new Response(
      JSON.stringify({
        text: result.text,
        language: language,
        segments: result.segments
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in audio-transcription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Failed to transcribe audio. Using Lovable AI (Gemini 2.5 Flash) for transcription.'
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
