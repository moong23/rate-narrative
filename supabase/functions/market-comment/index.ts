import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TONE_STYLES: Record<string, string> = {
  pro: "블룸버그 FX 전략가처럼 중립적이고 차분한 분석가 톤으로 작성하세요. 전문적이고 데이터 중심으로.",
  cheerful: "초보자를 위해 친근하고 이모지가 풍부한 톤으로 작성하세요. 격려하고 긍정적으로. 1-2개의 관련 이모지를 사용하세요.",
  dry: "비꼬는 듯하고 무심한 톤으로 짧은 문장으로 작성하세요. 재치있지만 악의적이지 않게.",
  professor: "거시경제학 교수처럼 격식있고 정확하게 작성하세요. 간단한 교육적 인사이트를 포함하세요.",
  zen: "시장을 관찰하는 차분한 명상가처럼 작성하세요. 철학적이고 균형잡힌 시각으로."
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
    const trendText = trend > 0 ? "상승세" : trend < 0 ? "하락세" : "보합세";
    const eventsList = events?.length > 0 ? `오늘의 주요 이벤트: ${events.join(", ")}` : "";

    const systemPrompt = `당신은 FX 대시보드의 시장 해설가입니다. 오늘의 시장 전망에 대해 정확히 한 문장(최대 80자)으로 한국어로 작성하세요. ${style}`;
    
    const userPrompt = `${pairName}에 대한 한 문장 시장 코멘트를 한국어로 작성하세요. 현재 추세: ${trendText}. ${eventsList}. 80자 이내로 작성하세요.`;

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
