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
    const { frameData, duration, language = 'fr' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing virality score for ${duration}s clip in ${language}`);
    
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

    const systemPrompt = `You are a viral content expert specialized in analyzing short-form video content (TikTok, YouTube Shorts, Instagram Reels).
       Analyze the video frame and duration to predict virality potential.
       
       Evaluate based on:
       - Visual appeal and contrast
       - Composition and framing
       - Potential for emotional engagement
       - Optimal duration (15-60s is ideal)
       - Hook potential (first 3 seconds)
       - Niche appeal vs broad appeal
       
       CRITICAL: ALL content MUST be in ${langName}.`;

    const userPrompt = `Analyze this ${Math.round(duration)}s video clip frame.
       Provide a virality score (1-100) with detailed feedback.
       
       Return ONLY valid JSON with this structure in ${langName}:
       {
         "score": 75,
         "category": "high/medium/low",
         "strengths": ["strength 1 in ${langName}", "strength 2 in ${langName}"],
         "weaknesses": ["weakness 1 in ${langName}", "weakness 2 in ${langName}"],
         "suggestions": ["suggestion 1 in ${langName}", "suggestion 2 in ${langName}"]
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
          { 
            role: "user", 
            content: [
              { type: "text", text: userPrompt },
              { 
                type: "image_url", 
                image_url: { url: frameData }
              }
            ]
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log("AI response:", content);

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
        score: 50,
        category: "medium",
        strengths: [language === "fr" ? "Contenu analysable" : "Analyzable content"],
        weaknesses: [language === "fr" ? "Analyse limitée" : "Limited analysis"],
        suggestions: [language === "fr" ? "Améliorer la qualité de la vidéo" : "Improve video quality"]
      };
    }

    console.log("Final analysis:", analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in virality-score:", error);
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
