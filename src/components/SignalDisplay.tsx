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
      <div className="glass-card p-6 animate-pulse">
        <div className="h-6 w-40 bg-muted rounded mb-4" />
        <div className="h-12 w-32 bg-muted rounded mb-4" />
        <div className="h-20 w-full bg-muted rounded" />
      </div>
    );
  }

  const signalConfig = {
    long: {
      label: 'LONG',
      icon: TrendingUp,
      className: 'signal-long glow-bullish',
      color: 'text-bullish',
      bgColor: 'bg-bullish/10',
    },
    short: {
      label: 'SHORT',
      icon: TrendingDown,
      className: 'signal-short glow-bearish',
      color: 'text-bearish',
      bgColor: 'bg-bearish/10',
    },
    neutral: {
      label: 'NEUTRAL',
      icon: Minus,
      className: 'signal-neutral',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/50',
    },
  };

  const config = signalConfig[signal.recommendation];
  const SignalIcon = config.icon;

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Trading Signal
        </h3>
        <div className="text-xs text-muted-foreground">
          Confidence: <span className={config.color}>{signal.confidence}%</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className={cn('signal-badge flex items-center gap-2', config.className)}>
          <SignalIcon className="w-4 h-4" />
          {config.label}
        </div>
        <div className={cn('px-3 py-1 rounded-full text-sm', config.bgColor, config.color)}>
          Score: {signal.finalScore.toFixed(1)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={cn('p-3 rounded-lg', config.bgColor)}>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            Trend
          </div>
          <p className={cn('font-mono font-semibold', 
            signal.trendScore > 0 ? 'text-bullish' : signal.trendScore < 0 ? 'text-bearish' : 'text-muted-foreground'
          )}>
            {signal.trendScore > 0 ? '+' : ''}{signal.trendScore.toFixed(1)}
          </p>
        </div>
        <div className={cn('p-3 rounded-lg', config.bgColor)}>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Newspaper className="w-3.5 h-3.5" />
            Sentiment
          </div>
          <p className={cn('font-mono font-semibold',
            signal.newsScore > 0 ? 'text-bullish' : signal.newsScore < 0 ? 'text-bearish' : 'text-muted-foreground'
          )}>
            {signal.newsScore > 0 ? '+' : ''}{signal.newsScore.toFixed(1)}
          </p>
        </div>
        <div className={cn('p-3 rounded-lg', config.bgColor)}>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Zap className="w-3.5 h-3.5" />
            Volatility
          </div>
          <p className="font-mono font-semibold text-muted-foreground">
            -{signal.volatilityPenalty.toFixed(1)}
          </p>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Analysis Rationale</h4>
        <p className="text-sm leading-relaxed text-foreground/90">
          {signal.rationale}
        </p>
      </div>

      <p className="mt-4 text-xs text-muted-foreground text-center">
        ⚠️ For research purposes only. Not financial advice.
      </p>
    </div>
  );
}
