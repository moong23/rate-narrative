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
      <article className="research-card p-6 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded mb-4" />
        <div className="h-10 w-44 bg-muted rounded mb-4" />
        <div className="h-4 w-36 bg-muted rounded" />
      </article>
    );
  }

  const isPositive = rate.change >= 0;
  const is7dPositive = rate.change7d >= 0;

  return (
    <article className="research-card p-6 animate-fade-in" role="region" aria-label={`${rate.pair.base}/${rate.pair.quote} current rate`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl" aria-hidden="true">{rate.pair.flag}</span>
            <h2 className="text-xl font-semibold">
              {rate.pair.base}/{rate.pair.quote}
            </h2>
          </div>
          <p className="text-caption">{rate.pair.name}</p>
        </div>
        <div className="flex items-center gap-1.5 text-caption">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Live</span>
          <span className="w-1.5 h-1.5 bg-bullish rounded-full animate-pulse" aria-hidden="true" />
        </div>
      </div>

      <div className="mb-4">
        <div className="font-mono text-4xl font-bold tracking-tight mb-3">
          {rate.rate.toLocaleString(undefined, {
            minimumFractionDigits: rate.pair.quote === 'JPY' || rate.pair.quote === 'KRW' ? 2 : 4,
            maximumFractionDigits: rate.pair.quote === 'JPY' || rate.pair.quote === 'KRW' ? 2 : 4,
          })}
        </div>
        
        <div className="flex items-center gap-5">
          <div className={cn(
            'flex items-center gap-1.5 text-sm font-medium',
            isPositive ? 'text-bullish' : 'text-bearish'
          )}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <TrendingDown className="w-4 h-4" aria-hidden="true" />
            )}
            <span aria-label={`Daily change ${isPositive ? 'up' : 'down'} ${Math.abs(rate.changePercent).toFixed(2)} percent`}>
              {isPositive ? '+' : ''}{rate.changePercent.toFixed(2)}%
            </span>
            <span className="text-caption">1d</span>
          </div>
          
          <div className={cn(
            'flex items-center gap-1.5 text-sm font-medium',
            is7dPositive ? 'text-bullish' : 'text-bearish'
          )}>
            {is7dPositive ? (
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <TrendingDown className="w-4 h-4" aria-hidden="true" />
            )}
            <span aria-label={`Weekly change ${is7dPositive ? 'up' : 'down'} ${Math.abs(rate.change7dPercent).toFixed(2)} percent`}>
              {is7dPositive ? '+' : ''}{rate.change7dPercent.toFixed(2)}%
            </span>
            <span className="text-caption">7d</span>
          </div>
        </div>
      </div>

      <div className="flex gap-8 pt-4 border-t border-border">
        <div>
          <span className="text-caption block mb-0.5">24h High</span>
          <p className="font-mono font-medium text-bullish">
            {rate.high24h.toLocaleString(undefined, { minimumFractionDigits: 4 })}
          </p>
        </div>
        <div>
          <span className="text-caption block mb-0.5">24h Low</span>
          <p className="font-mono font-medium text-bearish">
            {rate.low24h.toLocaleString(undefined, { minimumFractionDigits: 4 })}
          </p>
        </div>
      </div>
    </article>
  );
}
