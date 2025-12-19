import { useMemo } from 'react';
import { TradingSignal, HistoricalRate, NewsArticle, CurrencyPair, SignalType } from '@/types/fx';

function calculateTrendScore(rates: HistoricalRate[]): number {
  if (rates.length < 5) return 0;
  
  const recentRates = rates.slice(-20);
  const firstRate = recentRates[0].rate;
  const lastRate = recentRates[recentRates.length - 1].rate;
  
  const percentChange = ((lastRate - firstRate) / firstRate) * 100;
  
  // Calculate momentum (rate of change acceleration)
  const midPoint = Math.floor(recentRates.length / 2);
  const firstHalfAvg = recentRates.slice(0, midPoint).reduce((sum, r) => sum + r.rate, 0) / midPoint;
  const secondHalfAvg = recentRates.slice(midPoint).reduce((sum, r) => sum + r.rate, 0) / (recentRates.length - midPoint);
  
  const momentum = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  
  // Score from -100 to 100
  return Math.max(-100, Math.min(100, percentChange * 10 + momentum * 20));
}

function calculateNewsScore(news: NewsArticle[]): number {
  if (news.length === 0) return 0;
  
  const sentimentValues = {
    bullish: 1,
    neutral: 0,
    bearish: -1,
  };
  
  const totalScore = news.reduce((sum, article) => {
    const weight = article.sentimentScore;
    return sum + sentimentValues[article.sentiment] * weight;
  }, 0);
  
  return (totalScore / news.length) * 100;
}

function calculateVolatilityPenalty(rates: HistoricalRate[]): number {
  if (rates.length < 5) return 0;
  
  const returns = [];
  for (let i = 1; i < rates.length; i++) {
    returns.push((rates[i].rate - rates[i - 1].rate) / rates[i - 1].rate);
  }
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  // Higher volatility = higher penalty (0 to 30)
  return Math.min(30, stdDev * 1000);
}

function getRecommendation(score: number): SignalType {
  if (score > 20) return 'long';
  if (score < -20) return 'short';
  return 'neutral';
}

function generateRationale(
  trendScore: number,
  newsScore: number,
  volatilityPenalty: number,
  recommendation: SignalType,
  pair: CurrencyPair
): string {
  const trendDirection = trendScore > 0 ? 'upward' : trendScore < 0 ? 'downward' : 'sideways';
  const newsDirection = newsScore > 0 ? 'positive' : newsScore < 0 ? 'negative' : 'mixed';
  const volatilityLevel = volatilityPenalty > 20 ? 'high' : volatilityPenalty > 10 ? 'moderate' : 'low';
  
  const rationales: Record<SignalType, string> = {
    long: `Technical analysis shows a ${trendDirection} trend with ${Math.abs(trendScore).toFixed(0)}% momentum. Market sentiment is ${newsDirection} based on recent news coverage. ${volatilityLevel.charAt(0).toUpperCase() + volatilityLevel.slice(1)} volatility suggests ${volatilityLevel === 'high' ? 'cautious position sizing' : 'favorable entry conditions'}. Consider going long on ${pair.base}/${pair.quote}.`,
    short: `Charts indicate a ${trendDirection} trend with ${Math.abs(trendScore).toFixed(0)}% momentum shift. News sentiment is ${newsDirection}, reinforcing bearish outlook. ${volatilityLevel.charAt(0).toUpperCase() + volatilityLevel.slice(1)} volatility environment. Consider short positions on ${pair.base}/${pair.quote}.`,
    neutral: `Price action shows ${trendDirection} movement with mixed signals. News sentiment remains ${newsDirection}. ${volatilityLevel.charAt(0).toUpperCase() + volatilityLevel.slice(1)} volatility suggests waiting for clearer directional bias before taking positions on ${pair.base}/${pair.quote}.`,
  };
  
  return rationales[recommendation];
}

export function useSignals(
  pair: CurrencyPair,
  historicalRates: HistoricalRate[],
  news: NewsArticle[]
): TradingSignal | null {
  return useMemo(() => {
    if (historicalRates.length === 0) return null;
    
    const trendScore = calculateTrendScore(historicalRates);
    const newsScore = calculateNewsScore(news);
    const volatilityPenalty = calculateVolatilityPenalty(historicalRates);
    
    const finalScore = trendScore * 0.5 + newsScore * 0.3 - volatilityPenalty;
    const recommendation = getRecommendation(finalScore);
    const confidence = Math.min(100, Math.abs(finalScore) + (100 - volatilityPenalty));
    
    return {
      pairId: pair.id,
      date: new Date(),
      trendScore,
      newsScore,
      volatilityPenalty,
      finalScore,
      recommendation,
      rationale: generateRationale(trendScore, newsScore, volatilityPenalty, recommendation, pair),
      confidence: Math.round(confidence),
    };
  }, [pair, historicalRates, news]);
}
