import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subtitles, targetLanguages } = await req.json();
    
    if (!subtitles || !targetLanguages || targetLanguages.length === 0) {
      throw new Error('Subtitles and target languages are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Translating subtitles to ${targetLanguages.length} languages`);

    // Format subtitles for translation
    const subtitleText = subtitles.map((sub: any) => 
      `[${sub.start}s - ${sub.end}s] ${sub.text}`
    ).join('\n');

    const translations: Record<string, any[]> = {};

    // Translate to each target language
    for (const lang of targetLanguages) {
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
              content: `You are a professional subtitle translator. Translate subtitles while preserving timing markers [Xs - Ys] exactly as they are. Maintain natural language flow and cultural context for the target language: ${lang}. Output ONLY the translated subtitles with timing markers, nothing else.`
            },
            {
              role: 'user',
              content: `Translate these subtitles to ${lang}:\n\n${subtitleText}`
            }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (response.status === 402) {
          throw new Error('Payment required. Please add credits to your workspace.');
        }
        const errorText = await response.text();
        console.error(`AI API error for ${lang}:`, response.status, errorText);
        throw new Error(`Translation failed for ${lang}`);
      }

      const data = await response.json();
      const translatedText = data.choices[0].message.content;

      // Parse translated subtitles back into structured format
      const translatedSubtitles = translatedText.split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => {
          const match = line.match(/\[(\d+\.?\d*)s - (\d+\.?\d*)s\] (.+)/);
          if (match) {
            return {
              start: parseFloat(match[1]),
              end: parseFloat(match[2]),
              text: match[3].trim()
            };
          }
          return null;
        })
        .filter(Boolean);

      translations[lang] = translatedSubtitles;
      console.log(`Translated to ${lang}: ${translatedSubtitles.length} segments`);
    }

    return new Response(
      JSON.stringify({ translations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Translation failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
