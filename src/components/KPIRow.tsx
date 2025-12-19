import { KPIMetrics, CurrencyPair } from '@/types/fx';
import { TrendingUp, TrendingDown, Activity, BarChart3, LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIRowProps {
  metrics: KPIMetrics | null;
  pair: CurrencyPair;
  loading: boolean;
}

interface KPICardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  animationDelay?: string;
}

function KPICard({ label, value, subValue, icon, trend, animationDelay }: KPICardProps) {
  return (
    <article 
      className={cn("kpi-card animate-fade-in", animationDelay)}
      role="group"
      aria-label={label}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-caption uppercase tracking-wider">{label}</span>
        <div className={cn(
          'p-1.5 rounded-md',
          trend === 'up' ? 'bg-bullish/10 text-bullish' :
          trend === 'down' ? 'bg-bearish/10 text-bearish' :
          'bg-muted text-muted-foreground'
        )} aria-hidden="true">
          {icon}
        </div>
      </div>
      <div className={cn(
        'font-mono text-xl font-semibold',
        trend === 'up' ? 'text-bullish' :
        trend === 'down' ? 'text-bearish' :
        'text-foreground'
      )}>
        {value}
      </div>
      {subValue && (
        <div className="text-caption mt-1">{subValue}</div>
      )}
    </article>
  );
}

function KPISkeleton() {
  return (
    <div className="kpi-card animate-pulse">
      <div className="h-3 w-16 bg-muted rounded mb-3" />
      <div className="h-6 w-20 bg-muted rounded mb-1" />
      <div className="h-3 w-14 bg-muted rounded" />
    </div>
  );
}

export function KPIRow({ metrics, pair, loading }: KPIRowProps) {
  if (loading || !metrics) {
    return (
      <section aria-label="Key performance indicators" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => <KPISkeleton key={i} />)}
      </section>
    );
  }

  const formatRate = (rate: number) => {
    const decimals = pair.quote === 'JPY' || pair.quote === 'KRW' ? 2 : 4;
    return rate.toFixed(decimals);
  };

  return (
    <section aria-label="Key performance indicators" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <KPICard
        label="Current Rate"
        value={formatRate(metrics.currentRate)}
        subValue={`${pair.base}/${pair.quote}`}
        icon={<Activity className="w-3.5 h-3.5" />}
        animationDelay="delay-50"
      />
      
      <KPICard
        label="Daily"
        value={`${metrics.dailyChangePercent >= 0 ? '+' : ''}${metrics.dailyChangePercent.toFixed(2)}%`}
        subValue={`${metrics.dailyChange >= 0 ? '+' : ''}${formatRate(metrics.dailyChange)}`}
        icon={metrics.dailyChange >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        trend={metrics.dailyChange >= 0 ? 'up' : 'down'}
        animationDelay="delay-100"
      />
      
      <KPICard
        label="7-Day"
        value={`${metrics.weeklyChangePercent >= 0 ? '+' : ''}${metrics.weeklyChangePercent.toFixed(2)}%`}
        subValue={`${metrics.weeklyChange >= 0 ? '+' : ''}${formatRate(metrics.weeklyChange)}`}
        icon={metrics.weeklyChange >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        trend={metrics.weeklyChange >= 0 ? 'up' : 'down'}
        animationDelay="delay-150"
      />
      
      <KPICard
        label="7d MA"
        value={formatRate(metrics.ma7)}
        subValue={metrics.ma7 > metrics.ma30 ? '↑ Above 30d' : '↓ Below 30d'}
        icon={<LineChart className="w-3.5 h-3.5" />}
        trend={metrics.ma7 > metrics.ma30 ? 'up' : 'down'}
        animationDelay="delay-200"
      />
      
      <KPICard
        label="30d MA"
        value={formatRate(metrics.ma30)}
        subValue="Long-term trend"
        icon={<LineChart className="w-3.5 h-3.5" />}
        animationDelay="delay-250"
      />
      
      <KPICard
        label="14d Vol (σ)"
        value={`${(metrics.stdDev14 * 100).toFixed(2)}%`}
        subValue={`${metrics.volatilityLevel.charAt(0).toUpperCase() + metrics.volatilityLevel.slice(1)}`}
        icon={<BarChart3 className="w-3.5 h-3.5" />}
        trend={metrics.volatilityLevel === 'high' ? 'down' : metrics.volatilityLevel === 'low' ? 'up' : 'neutral'}
        animationDelay="delay-300"
      />
    </section>
  );
}
