import { useMemo } from 'react';
import { TradingSignal, KPIMetrics, NewsArticle, CurrencyPair, SignalType, VOLATILITY_THRESHOLDS } from '@/types/fx';

/**
 * Signal calculation based on:
 * - Trend: +1 if 7d MA > 30d MA, else -1
 * - News: Average sentiment score (-1 to +1)
 * - Volatility Penalty: 1 if 14-day std dev > threshold, else 0
 * 
 * Final Score = 0.6 * trend + 0.4 * news - 0.2 * vol_penalty
 */

function calculateTrendScore(kpiMetrics: KPIMetrics): number {
  // +1 if 7d MA > 30d MA (bullish), -1 otherwise (bearish)
  return kpiMetrics.ma7 > kpiMetrics.ma30 ? 1 : -1;
}

function calculateNewsScore(news: NewsArticle[]): number {
  if (news.length === 0) return 0;
  
  const totalScore = news.reduce((sum, article) => {
    return sum + article.sentimentScore;
  }, 0);
  
  // Returns value between -1 and +1
  return totalScore / news.length;
}

function calculateVolatilityPenalty(kpiMetrics: KPIMetrics): number {
  // 1 if high volatility, 0 otherwise
  return kpiMetrics.stdDev14 > VOLATILITY_THRESHOLDS.high ? 1 : 0;
}

function getRecommendation(score: number): SignalType {
  if (score > 0.2) return 'long';
  if (score < -0.2) return 'short';
  return 'neutral';
}

function generateRationale(
  trendScore: number,
  newsScore: number,
  volatilityPenalty: number,
  kpiMetrics: KPIMetrics,
  pair: CurrencyPair
): string[] {
  const rationale: string[] = [];
  
  // Trend rationale
  const trendDirection = trendScore > 0 ? 'bullish' : 'bearish';
  const maGap = ((kpiMetrics.ma7 - kpiMetrics.ma30) / kpiMetrics.ma30 * 100).toFixed(2);
  rationale.push(
    `📈 **Trend**: ${trendDirection.charAt(0).toUpperCase() + trendDirection.slice(1)} momentum detected. 7-day MA is ${Math.abs(parseFloat(maGap))}% ${parseFloat(maGap) > 0 ? 'above' : 'below'} 30-day MA.`
  );
  
  // Sentiment rationale
  const sentimentLabel = newsScore > 0.2 ? 'positive' : newsScore < -0.2 ? 'negative' : 'mixed';
  rationale.push(
    `📰 **Sentiment**: News sentiment is ${sentimentLabel} (score: ${(newsScore * 100).toFixed(0)}%). Recent headlines ${newsScore > 0 ? 'support' : newsScore < 0 ? 'weigh on' : 'are neutral for'} ${pair.base}/${pair.quote}.`
  );
  
  // Volatility rationale
  const volLevel = kpiMetrics.volatilityLevel;
  const volAdvice = volatilityPenalty > 0 
    ? 'Consider smaller position sizes.' 
    : 'Market conditions favor normal positioning.';
  rationale.push(
    `⚡ **Volatility**: ${volLevel.charAt(0).toUpperCase() + volLevel.slice(1)} volatility environment (14d σ: ${(kpiMetrics.stdDev14 * 100).toFixed(2)}%). ${volAdvice}`
  );
  
  return rationale;
}

export function useSignals(
  pair: CurrencyPair,
  kpiMetrics: KPIMetrics | null,
  news: NewsArticle[]
): TradingSignal | null {
  return useMemo(() => {
    if (!kpiMetrics) return null;
    
    const trendScore = calculateTrendScore(kpiMetrics);
    const newsScore = calculateNewsScore(news);
    const volatilityPenalty = calculateVolatilityPenalty(kpiMetrics);
    
    // Final score: 0.6 * trend + 0.4 * news - 0.2 * vol_penalty
    const finalScore = 0.6 * trendScore + 0.4 * newsScore - 0.2 * volatilityPenalty;
    const recommendation = getRecommendation(finalScore);
    
    // Confidence based on alignment of signals
    const signalsAligned = (trendScore > 0 && newsScore > 0) || (trendScore < 0 && newsScore < 0);
    const baseConfidence = signalsAligned ? 75 : 55;
    const volAdjustment = volatilityPenalty > 0 ? -10 : 5;
    const confidence = Math.min(95, Math.max(30, baseConfidence + volAdjustment + Math.abs(finalScore) * 10));
    
    return {
      pairId: pair.id,
      date: new Date(),
      trendScore,
      newsScore,
      volatilityPenalty,
      finalScore,
      recommendation,
      rationale: generateRationale(trendScore, newsScore, volatilityPenalty, kpiMetrics, pair),
      confidence: Math.round(confidence),
    };
  }, [pair, kpiMetrics, news]);
}
