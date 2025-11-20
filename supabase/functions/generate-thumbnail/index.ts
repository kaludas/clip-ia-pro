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
    const { frameData, title, language = 'fr' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating thumbnail with title: ${title} in ${language}`);

    // Generate catchphrase using text analysis
    const catchphraseResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `Generate a short, punchy catchphrase (max 5 words) for a video thumbnail. Must be in ${language === 'fr' ? 'French' : language === 'en' ? 'English' : language}.` 
          },
          { 
            role: "user", 
            content: `Based on this title: "${title}", create a viral catchphrase. Return ONLY the catchphrase, nothing else.` 
          }
        ],
        temperature: 0.9,
      }),
    });

    if (!catchphraseResponse.ok) {
      throw new Error(`Failed to generate catchphrase: ${catchphraseResponse.status}`);
    }

    const catchphraseData = await catchphraseResponse.json();
    const catchphrase = catchphraseData.choices[0].message.content.trim().replace(/['"]/g, '');
    
    console.log("Generated catchphrase:", catchphrase);

    // Generate thumbnail image with text overlay
    const imagePrompt = `Create a vibrant, eye-catching YouTube Shorts/TikTok/Reels thumbnail.
Style: Modern, high contrast, gaming/streaming aesthetic.
Include bold text overlay: "${catchphrase}"
Text style: Large, bold, white text with black outline for readability.
Background: Based on the provided video frame, enhance colors and add dynamic elements.
Format: Vertical 9:16 aspect ratio.
Quality: High resolution, optimized for mobile viewing.`;

    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: imagePrompt },
              { 
                type: "image_url", 
                image_url: { url: frameData }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error("Image generation error:", imageResponse.status, errorText);
      throw new Error(`Image generation failed: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const generatedImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      throw new Error("No image generated in response");
    }

    console.log("Thumbnail generated successfully");

    return new Response(JSON.stringify({
      thumbnail: generatedImage,
      catchphrase: catchphrase
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-thumbnail:", error);
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
