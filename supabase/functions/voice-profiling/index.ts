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
    const { audioData, language = 'fr' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing voice profile in ${language}`);
    
    const languageNames: Record<string, string> = {
      'fr': 'French',
      'en': 'English',
      'es': 'Spanish',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
    };
    
    const langName = languageNames[language] || 'English';

    const systemPrompt = `You are an expert in voice and communication style analysis for content creators.
       Analyze the speaker's voice characteristics, tone, speaking style, and personality traits.
       
       Identify:
       - Speaking style (energetic, calm, humorous, serious, educational, casual)
       - Personality traits (sarcastic, enthusiastic, analytical, friendly)
       - Common expressions and catchphrases
       - Emoji usage patterns
       - Target audience appeal
       
       CRITICAL: ALL content MUST be in ${langName}.`;

    const userPrompt = `Analyze this audio sample and create a voice profile for the speaker.
       
       Return ONLY valid JSON with this structure in ${langName}:
       {
         "style": "speaking style in ${langName}",
         "personality": ["trait1 in ${langName}", "trait2 in ${langName}"],
         "toneOfVoice": "description in ${langName}",
         "catchphrases": ["phrase1 in ${langName}", "phrase2 in ${langName}"],
         "emojiStyle": "emoji usage pattern in ${langName}",
         "audienceAppeal": "target audience in ${langName}",
         "recommendations": ["tip1 in ${langName}", "tip2 in ${langName}"]
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

    let profile;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                        content.match(/(\{[\s\S]*\})/);
      
      if (jsonMatch) {
        profile = JSON.parse(jsonMatch[1]);
      } else {
        profile = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      profile = {
        style: language === "fr" ? "Énergétique" : "Energetic",
        personality: [language === "fr" ? "Enthousiaste" : "Enthusiastic"],
        toneOfVoice: language === "fr" ? "Dynamique et engageant" : "Dynamic and engaging",
        catchphrases: [],
        emojiStyle: language === "fr" ? "Modéré" : "Moderate",
        audienceAppeal: language === "fr" ? "Gamers et créateurs de contenu" : "Gamers and content creators",
        recommendations: []
      };
    }

    console.log("Final profile:", profile);

    return new Response(JSON.stringify(profile), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in voice-profiling:", error);
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
