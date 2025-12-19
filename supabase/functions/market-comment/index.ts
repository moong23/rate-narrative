import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TONE_STYLES: Record<string, string> = {
  pro: "Write in a neutral analyst tone, like a Bloomberg FX strategist. Keep it professional and data-driven.",
  cheerful: "Write in a friendly, emoji-rich tone for a curious beginner. Be encouraging and positive. Use 1-2 relevant emojis.",
  dry: "Write in a sarcastic, blunt tone with short sentences. Be witty but not mean.",
  professor: "Write like a macroeconomics professor—formal and precise. Include a brief educational insight.",
  zen: "Write like a calm, meditative monk observing the market. Be philosophical and balanced."
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pairName, trend, events, agentId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const style = TONE_STYLES[agentId] || TONE_STYLES.pro;
    const trendText = trend > 0 ? "bullish" : trend < 0 ? "bearish" : "neutral";
    const eventsList = events?.length > 0 ? `Today's key events: ${events.join(", ")}` : "";

    const systemPrompt = `You are a market commentator for an FX dashboard. Generate exactly ONE sentence (max 100 characters) about today's market outlook. ${style}`;
    
    const userPrompt = `Generate a one-sentence market comment for ${pairName}. Current trend: ${trendText}. ${eventsList}. Keep it under 100 characters.`;

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
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded", comment: null }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required", comment: null }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const comment = data.choices?.[0]?.message?.content?.trim() || null;

    return new Response(JSON.stringify({ comment }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("market-comment error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      comment: null 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
