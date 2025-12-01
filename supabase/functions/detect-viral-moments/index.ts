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
    const { frames, duration, language = 'fr' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Detecting viral moments for ${duration}s video in ${language}`);
    
    const languageNames: Record<string, string> = {
      'fr': 'French',
      'en': 'English',
      'es': 'Spanish',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'ru': 'Russian',
      'hi': 'Hindi'
    };
    
    const langName = languageNames[language] || 'English';

    const systemPrompt = `You are an expert video content analyst specialized in identifying viral moments for short-form content (TikTok, YouTube Shorts, Instagram Reels).
       Analyze the provided video frames to detect the most engaging, viral-worthy moments.
       
       Focus on identifying moments with:
       - Strong emotional peaks (excitement, surprise, humor, tension)
       - Visual interest and dynamic action
       - Potential for standalone narrative (hook, development, payoff)
       - Peak engagement indicators (reactions, gameplay highlights, key revelations)
       - Optimal clip length (15-60 seconds)
       
       CRITICAL: ALL content MUST be in ${langName}.`;

    const userPrompt = `Analyze these frames from a ${Math.round(duration)}s video and identify the 3-5 best viral moments.
       
       For each moment, provide:
       - Start timestamp (in seconds)
       - End timestamp (in seconds)
       - Reason (why this moment is viral-worthy)
       - Hook (catchy title for this moment)
       - Virality score (1-100)
       
       Return ONLY valid JSON with this structure in ${langName}:
       {
         "moments": [
           {
             "start": 10.5,
             "end": 25.3,
             "reason": "reason in ${langName}",
             "hook": "catchy title in ${langName}",
             "score": 85,
             "tags": ["tag1 in ${langName}", "tag2 in ${langName}"]
           }
         ]
       }`;

    // Prepare content with multiple frames for comprehensive analysis
    const content: any[] = [
      { type: "text", text: userPrompt }
    ];

    // Add up to 10 frames for analysis
    frames.slice(0, 10).forEach((frameData: string) => {
      content.push({
        type: "image_url",
        image_url: { url: frameData }
      });
    });

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
          { 
            role: "user", 
            content: content
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    const responseContent = data.choices[0].message.content;
    
    console.log("AI response:", responseContent);

    let analysis;
    try {
      const jsonMatch = responseContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                        responseContent.match(/(\{[\s\S]*\})/);
      
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1]);
      } else {
        analysis = JSON.parse(responseContent);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", responseContent);
      analysis = {
        moments: [
          {
            start: 0,
            end: Math.min(30, duration),
            reason: language === "fr" ? "Moment détecté automatiquement" : "Automatically detected moment",
            hook: language === "fr" ? "Moment Viral" : "Viral Moment",
            score: 75,
            tags: [language === "fr" ? "Gaming" : "Gaming"]
          }
        ]
      };
    }

    console.log("Final analysis:", analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in detect-viral-moments:", error);
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
