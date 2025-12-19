export interface CurrencyPair {
  id: string;
  base: string;
  quote: string;
  name: string;
  flag: string;
}

export interface ExchangeRate {
  pair: CurrencyPair;
  rate: number;
  change: number;
  changePercent: number;
  change7d: number;
  change7dPercent: number;
  high24h: number;
  low24h: number;
  timestamp: Date;
}

export interface HistoricalRate {
  date: string;
  rate: number;
}

export interface KPIMetrics {
  currentRate: number;
  dailyChange: number;
  dailyChangePercent: number;
  weeklyChange: number;
  weeklyChangePercent: number;
  ma7: number;
  ma30: number;
  stdDev14: number;
  volatilityLevel: 'low' | 'medium' | 'high';
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  publishedAt: Date;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number; // -1 to +1
  url: string;
}

export type SignalType = 'long' | 'short' | 'neutral';

export interface TradingSignal {
  pairId: string;
  date: Date;
  trendScore: number; // +1 or -1 based on MA crossover
  newsScore: number; // -1 to +1 average sentiment
  volatilityPenalty: number; // 0 or 1
  finalScore: number; // 0.6*trend + 0.4*news - 0.2*vol
  recommendation: SignalType;
  rationale: string[];
  confidence: number;
}

export type TimeRange = '1M' | '3M' | '1Y';

export const CURRENCY_PAIRS: CurrencyPair[] = [
  { id: 'USD_KRW', base: 'USD', quote: 'KRW', name: 'US Dollar / Korean Won', flag: '🇰🇷' },
  { id: 'USD_JPY', base: 'USD', quote: 'JPY', name: 'US Dollar / Japanese Yen', flag: '🇯🇵' },
  { id: 'EUR_USD', base: 'EUR', quote: 'USD', name: 'Euro / US Dollar', flag: '🇪🇺' },
  { id: 'GBP_USD', base: 'GBP', quote: 'USD', name: 'British Pound / US Dollar', flag: '🇬🇧' },
];

// Volatility thresholds (annualized)
export const VOLATILITY_THRESHOLDS = {
  low: 0.005,
  high: 0.015,
};
