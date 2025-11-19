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

    console.log(`Generating viral suggestions for ${duration}s clip in ${language}`);
    
    const languageInstructions: Record<string, { name: string; sampleEmojis: string }> = {
      'fr': { name: 'French', sampleEmojis: '🔥💯🎮' },
      'en': { name: 'English', sampleEmojis: '🔥💯🎮' },
      'es': { name: 'Spanish', sampleEmojis: '🔥💯🎮' },
      'de': { name: 'German', sampleEmojis: '🔥💯🎮' },
      'it': { name: 'Italian', sampleEmojis: '🔥💯🎮' },
      'pt': { name: 'Portuguese', sampleEmojis: '🔥💯🎮' },
      'ja': { name: 'Japanese', sampleEmojis: '🎮✨🔥' },
      'ko': { name: 'Korean', sampleEmojis: '🎮✨🔥' },
      'zh': { name: 'Chinese', sampleEmojis: '🎮✨🔥' },
      'ar': { name: 'Arabic', sampleEmojis: '🔥💯🎮' },
      'ru': { name: 'Russian', sampleEmojis: '🔥💯🎮' },
      'hi': { name: 'Hindi', sampleEmojis: '🔥💯🎮' }
    };
    
    const langInfo = languageInstructions[language] || languageInstructions['en'];

    const systemPrompt = `You are a viral marketing expert for TikTok, YouTube Shorts, and Instagram Reels.
       You analyze gaming/streaming clips and generate content in ${langInfo.name}.
       Generate:
       - A catchy viral title (max 60 characters)
       - 5-8 trending relevant hashtags (gaming, streaming, clips)
       - An engaging description (max 150 characters)
       
       Your style: dynamic, young, punchy. Use relevant emojis like ${langInfo.sampleEmojis}.
       Focus on emotion, action, and what makes the moment unique.
       
       CRITICAL: ALL content (title, hashtags, description) MUST be written entirely in ${langInfo.name}.`;

    const userPrompt = `Analyze this ${Math.round(duration)}s gaming/streaming clip image.
       Generate a viral title, trending hashtags, and engaging description in ${langInfo.name}.
       Return ONLY valid JSON with this structure:
       {
         "title": "catchy title here in ${langInfo.name}",
         "hashtags": ["tag1", "tag2", "tag3"],
         "description": "engaging description here in ${langInfo.name}"
       }`;

    // Call Lovable AI with vision
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
        temperature: 0.9,
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

    // Parse JSON from response
    let suggestions;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                        content.match(/(\{[\s\S]*\})/);
      
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[1]);
      } else {
        suggestions = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      // Fallback suggestions
      suggestions = {
        title: language === "fr" 
          ? "🔥 Moment INCROYABLE en live! 🎮" 
          : "🔥 INCREDIBLE moment LIVE! 🎮",
        hashtags: language === "fr"
          ? ["gaming", "twitch", "clip", "viral", "live", "streamer"]
          : ["gaming", "twitch", "clip", "viral", "live", "streamer"],
        description: language === "fr"
          ? "Regardez ce moment fou! Vous ne croirez pas ce qui s'est passé... 😱"
          : "Watch this insane moment! You won't believe what happened... 😱"
      };
    }

    console.log("Final suggestions:", suggestions);

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in viral-suggestions:", error);
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
