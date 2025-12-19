import { ExchangeRate } from '@/types/fx';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RateDisplayProps {
  rate: ExchangeRate | null;
  loading: boolean;
}

export function RateDisplay({ rate, loading }: RateDisplayProps) {
  if (loading || !rate) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded mb-4" />
        <div className="h-12 w-48 bg-muted rounded mb-4" />
        <div className="h-4 w-40 bg-muted rounded" />
      </div>
    );
  }

  const isPositive = rate.change >= 0;
  const is7dPositive = rate.change7d >= 0;

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{rate.pair.flag}</span>
            <span className="text-lg font-medium text-muted-foreground">
              {rate.pair.base}/{rate.pair.quote}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{rate.pair.name}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>Live</span>
          <span className="w-1.5 h-1.5 bg-bullish rounded-full animate-pulse" />
        </div>
      </div>

      <div className="mb-4">
        <div className="rate-number text-4xl mb-2">
          {rate.rate.toLocaleString(undefined, {
            minimumFractionDigits: rate.pair.quote === 'JPY' || rate.pair.quote === 'KRW' ? 2 : 4,
            maximumFractionDigits: rate.pair.quote === 'JPY' || rate.pair.quote === 'KRW' ? 2 : 4,
          })}
        </div>
        
        <div className="flex items-center gap-4">
          <div className={cn(
            'flex items-center gap-1.5 text-sm font-medium',
            isPositive ? 'text-bullish' : 'text-bearish'
          )}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {rate.changePercent.toFixed(2)}%
            </span>
            <span className="text-xs text-muted-foreground">1d</span>
          </div>
          
          <div className={cn(
            'flex items-center gap-1.5 text-sm font-medium',
            is7dPositive ? 'text-bullish' : 'text-bearish'
          )}>
            {is7dPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>
              {is7dPositive ? '+' : ''}
              {rate.change7dPercent.toFixed(2)}%
            </span>
            <span className="text-xs text-muted-foreground">7d</span>
          </div>
        </div>
      </div>

      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-muted-foreground">24h High</span>
          <p className="font-mono font-medium text-bullish">
            {rate.high24h.toLocaleString(undefined, { minimumFractionDigits: 4 })}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">24h Low</span>
          <p className="font-mono font-medium text-bearish">
            {rate.low24h.toLocaleString(undefined, { minimumFractionDigits: 4 })}
          </p>
        </div>
      </div>
    </div>
  );
}
