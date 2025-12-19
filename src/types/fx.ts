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
  high24h: number;
  low24h: number;
  timestamp: Date;
}

export interface HistoricalRate {
  date: string;
  rate: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  publishedAt: Date;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number;
  url: string;
}

export type SignalType = 'long' | 'short' | 'neutral';

export interface TradingSignal {
  pairId: string;
  date: Date;
  trendScore: number;
  newsScore: number;
  volatilityPenalty: number;
  finalScore: number;
  recommendation: SignalType;
  rationale: string;
  confidence: number;
}

export type TimeRange = '1M' | '3M' | '1Y';

export const CURRENCY_PAIRS: CurrencyPair[] = [
  { id: 'USD_KRW', base: 'USD', quote: 'KRW', name: 'US Dollar / Korean Won', flag: '🇰🇷' },
  { id: 'USD_JPY', base: 'USD', quote: 'JPY', name: 'US Dollar / Japanese Yen', flag: '🇯🇵' },
  { id: 'EUR_USD', base: 'EUR', quote: 'USD', name: 'Euro / US Dollar', flag: '🇪🇺' },
  { id: 'GBP_USD', base: 'GBP', quote: 'USD', name: 'British Pound / US Dollar', flag: '🇬🇧' },
];
