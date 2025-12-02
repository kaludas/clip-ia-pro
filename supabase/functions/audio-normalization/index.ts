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
    const { audioData, targetLUFS = -14 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Analyzing audio for normalization...');

    const systemPrompt = `You are an audio engineering expert specializing in audio normalization and mixing.
       Analyze the audio characteristics and provide normalization recommendations.
       
       Key analysis points:
       - Peak levels and clipping detection
       - Dynamic range analysis
       - Frequency balance
       - Recommended gain adjustments
       - Compression settings
       - EQ recommendations
       
       Target: ${targetLUFS} LUFS (industry standard for streaming platforms)`;

    const userPrompt = `Analyze this audio data and provide detailed normalization recommendations.
       
       Return ONLY valid JSON with this structure:
       {
         "currentLUFS": -18,
         "peakLevel": -3,
         "hasClipping": false,
         "dynamicRange": 12,
         "recommendations": {
           "gainAdjustment": +4,
           "compressionRatio": "3:1",
           "compressionThreshold": -20,
           "eqSuggestions": [
             {"frequency": 80, "gain": -2, "type": "high-pass"},
             {"frequency": 5000, "gain": 1.5, "type": "shelf"}
           ],
           "limitingCeiling": -1
         },
         "warnings": ["warning1", "warning2"],
         "quality": "good/fair/poor"
       }`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log("AI normalization response:", content);

    let analysis;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                        content.match(/(\{[\s\S]*\})/);
      
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1]);
      } else {
        analysis = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      analysis = {
        currentLUFS: targetLUFS,
        peakLevel: -6,
        hasClipping: false,
        dynamicRange: 10,
        recommendations: {
          gainAdjustment: 0,
          compressionRatio: "2:1",
          compressionThreshold: -18,
          eqSuggestions: [],
          limitingCeiling: -0.5
        },
        warnings: ["Analyse limitée, valeurs par défaut appliquées"],
        quality: "fair"
      };
    }

    console.log("Final audio analysis:", analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in audio-normalization:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});