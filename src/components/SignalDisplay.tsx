import { TradingSignal } from '@/types/fx';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Target, BarChart3, Newspaper, Zap } from 'lucide-react';

interface SignalDisplayProps {
  signal: TradingSignal | null;
  loading: boolean;
}

export function SignalDisplay({ signal, loading }: SignalDisplayProps) {
  if (loading || !signal) {
    return (
      <article className="research-card p-6 animate-pulse">
        <div className="h-5 w-32 bg-muted rounded mb-4" />
        <div className="h-10 w-28 bg-muted rounded mb-4" />
        <div className="h-16 w-full bg-muted rounded" />
      </article>
    );
  }

  const signalConfig = {
    long: {
      label: 'LONG',
      icon: TrendingUp,
      className: 'signal-long',
      color: 'text-bullish',
      bgColor: 'bg-bullish/5',
    },
    short: {
      label: 'SHORT',
      icon: TrendingDown,
      className: 'signal-short',
      color: 'text-bearish',
      bgColor: 'bg-bearish/5',
    },
    neutral: {
      label: 'NEUTRAL',
      icon: Minus,
      className: 'signal-neutral',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/30',
    },
  };

  const config = signalConfig[signal.recommendation];
  const SignalIcon = config.icon;

  return (
    <article 
      className="research-card p-6 animate-scale-in" 
      role="status" 
      aria-label={`Trading signal: ${signal.recommendation}`}
      aria-live="polite"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" aria-hidden="true" />
          Signal
        </h2>
        <span className="text-caption">
          Confidence: <span className={cn('font-medium', config.color)}>{signal.confidence}%</span>
        </span>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className={cn('signal-badge flex items-center gap-2', config.className)}>
          <SignalIcon className="w-4 h-4" aria-hidden="true" />
          {config.label}
        </div>
        <span className={cn('text-sm font-mono font-medium', config.color)}>
          Score: {signal.finalScore.toFixed(2)}
        </span>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className={cn('p-3 rounded-lg text-center border border-border', config.bgColor)}>
          <div className="flex items-center justify-center gap-1 text-caption mb-1">
            <BarChart3 className="w-3 h-3" aria-hidden="true" />
            <span>Trend</span>
          </div>
          <p className={cn('font-mono font-semibold text-lg', 
            signal.trendScore > 0 ? 'text-bullish' : 'text-bearish'
          )}>
            {signal.trendScore > 0 ? '+1' : '-1'}
          </p>
          <p className="text-caption">×0.6</p>
        </div>
        <div className={cn('p-3 rounded-lg text-center border border-border', config.bgColor)}>
          <div className="flex items-center justify-center gap-1 text-caption mb-1">
            <Newspaper className="w-3 h-3" aria-hidden="true" />
            <span>News</span>
          </div>
          <p className={cn('font-mono font-semibold text-lg',
            signal.newsScore > 0 ? 'text-bullish' : signal.newsScore < 0 ? 'text-bearish' : 'text-muted-foreground'
          )}>
            {signal.newsScore > 0 ? '+' : ''}{signal.newsScore.toFixed(2)}
          </p>
          <p className="text-caption">×0.4</p>
        </div>
        <div className={cn('p-3 rounded-lg text-center border border-border', config.bgColor)}>
          <div className="flex items-center justify-center gap-1 text-caption mb-1">
            <Zap className="w-3 h-3" aria-hidden="true" />
            <span>Vol</span>
          </div>
          <p className="font-mono font-semibold text-lg text-muted-foreground">
            -{signal.volatilityPenalty}
          </p>
          <p className="text-caption">×0.2</p>
        </div>
      </div>

      {/* Rationale */}
      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <h3 className="text-sm font-medium mb-3 text-muted-foreground">Why this signal?</h3>
        <ul className="space-y-2">
          {signal.rationale.map((point, i) => (
            <li key={i} className="text-sm leading-relaxed">
              {point}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-caption text-center" role="note">
        ⚠️ For research purposes only. Not financial advice.
      </p>
    </article>
  );
}
