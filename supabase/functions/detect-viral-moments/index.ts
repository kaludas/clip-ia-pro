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
       Analyze the provided video frames to detect ALL engaging, viral-worthy moments in the video.
       
       CRITICAL REQUIREMENTS FOR VIRAL MOMENTS:
       - MINIMUM duration: 20 seconds per clip (shorter clips lack context and narrative)
       - OPTIMAL duration: 30-60 seconds (perfect for platform algorithms)
       - QUANTITY: Identify 5-10 distinct moments (not just 3-5) to maximize content output
       - QUALITY: Each moment must have clear narrative arc (hook → development → payoff)
       
       Focus on identifying moments with:
       - Strong emotional peaks (excitement, surprise, humor, tension, revelation)
       - Visual interest and dynamic action (gameplay highlights, reactions, confrontations)
       - Standalone narrative potential (complete story that makes sense without context)
       - Peak engagement indicators (chat reactions, key moments, climactic sequences)
       - Dialogue or voiceover that adds context and personality
       - Transitions between calm and intense moments (contrast creates engagement)
       
       AVOID:
       - Static/boring segments with no action
       - Moments under 20 seconds (too short for viral potential)
       - Repetitive content (choose the BEST instance if similar moments exist)
       
       CRITICAL: ALL content MUST be in ${langName}.`;

    const userPrompt = `Analyze these frames from a ${Math.round(duration)}s video and identify the 5-10 BEST viral moments.
       
       REQUIREMENTS:
       - Each moment MUST be 20-60 seconds long (minimum 20s, optimal 30-60s)
       - Identify ALL significant engaging moments (aim for 7-10 clips from a 10min video)
       - Prioritize complete narrative arcs with clear beginning, middle, and end
       - Look for emotional peaks, gameplay highlights, funny reactions, intense confrontations
       - Each moment should work as standalone content without prior context
       
       For each moment, provide:
       - Start timestamp (in seconds) - mark where the action/setup begins
       - End timestamp (in seconds) - ensure minimum 20s duration, optimal 30-60s
       - Reason (detailed explanation of why this specific moment is viral-worthy)
       - Hook (catchy, click-worthy title that captures the essence)
       - Virality score (1-100, be generous with scores 75+ for genuinely good moments)
       - Tags (3-5 relevant tags describing the content)
       
       Return ONLY valid JSON with this structure in ${langName}:
       {
         "moments": [
           {
             "start": 10.5,
             "end": 45.8,
             "reason": "detailed reason in ${langName}",
             "hook": "catchy title in ${langName}",
             "score": 85,
             "tags": ["tag1 in ${langName}", "tag2 in ${langName}", "tag3 in ${langName}"]
           }
         ]
       }`;

    // Prepare content with multiple frames for comprehensive analysis
    const content: any[] = [
      { type: "text", text: userPrompt }
    ];

    // Add up to 15 frames for more comprehensive analysis
    frames.slice(0, 15).forEach((frameData: string) => {
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
            end: Math.min(45, duration),
            reason: language === "fr" ? "Moment détecté automatiquement - analyse complète recommandée" : "Automatically detected moment - full analysis recommended",
            hook: language === "fr" ? "Moment Viral Détecté" : "Viral Moment Detected",
            score: 70,
            tags: [language === "fr" ? "Contenu" : "Content"]
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
