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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es MonAide, l'assistant virtuel de MonShort.com, un outil d'IA pour créer des clips courts optimisés pour TikTok, YouTube Shorts et Instagram Reels à partir de longues vidéos.

Fonctionnalités principales de MonShort.com:
- Découpage IA intelligent: Analyse automatique et extraction des moments forts
- Détection Mots-Clés RP (Premium): Identification des clips viraux selon les tendances TikTok
- Recadrage automatique 9:16: Format vertical optimisé
- Sous-titres dynamiques: Génération automatique de sous-titres stylisés
- Traduction IA (Premium): 50+ langues pour toucher un public mondial
- Export HD/4K (Premium): Sans filigrane, qualité broadcast
- Publication automatique (Premium): Connexion TikTok/YouTube/Instagram avec planning optimal
- Suggestion de musique virale (Premium): Synchronisation avec les sons tendance
- Éditeur visuel rapide (Premium): Personnalisation sans logiciel lourd

Tarifs:
- Gratuit: 5 clips/mois, sous-titres de base, export 720p avec filigrane
- Pro (19,99€/mois): 50 clips/mois, toutes les fonctionnalités premium
- Agence (49,99€/mois): Clips illimités, multi-comptes, équipe

Tu dois:
- Répondre en français ou en anglais selon la langue de l'utilisateur
- Être précis et concis
- Aider à résoudre les problèmes techniques
- Expliquer les fonctionnalités
- Orienter vers le bon plan tarifaire
- Être chaleureux et professionnel`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-support error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
