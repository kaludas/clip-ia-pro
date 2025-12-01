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
    const { frameData, language = 'fr' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Recognizing products/locations in ${language}`);
    
    const languageNames: Record<string, string> = {
      'fr': 'French',
      'en': 'English',
      'es': 'Spanish',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
    };
    
    const langName = languageNames[language] || 'English';

    const systemPrompt = `You are an expert in product and location recognition for content monetization.
       Analyze video frames to identify visible products, brands, locations, and monetization opportunities.
       
       Identify:
       - Product brands and names
       - Gaming peripherals and equipment
       - Streaming gear
       - Recognizable locations
       - Potential affiliate opportunities
       
       CRITICAL: ALL content MUST be in ${langName}.`;

    const userPrompt = `Analyze this video frame and identify all visible products, brands, and locations.
       
       Return ONLY valid JSON with this structure in ${langName}:
       {
         "products": [
           {
             "name": "product name",
             "category": "category in ${langName}",
             "confidence": 95,
             "affiliatePotential": "high/medium/low",
             "suggestedLinks": ["platform1", "platform2"]
           }
         ],
         "locations": [
           {
             "name": "location name",
             "type": "type in ${langName}",
             "confidence": 90
           }
         ],
         "monetizationTips": ["tip1 in ${langName}", "tip2 in ${langName}"]
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

    let recognition;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                        content.match(/(\{[\s\S]*\})/);
      
      if (jsonMatch) {
        recognition = JSON.parse(jsonMatch[1]);
      } else {
        recognition = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      recognition = {
        products: [],
        locations: [],
        monetizationTips: [
          language === "fr" ? "Ajoutez des liens d'affiliation dans la description" : "Add affiliate links in the description"
        ]
      };
    }

    console.log("Final recognition:", recognition);

    return new Response(JSON.stringify(recognition), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in product-recognition:", error);
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
