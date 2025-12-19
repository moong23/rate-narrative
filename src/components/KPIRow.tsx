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
  delay?: number;
}

function KPICard({ label, value, subValue, icon, trend, delay = 0 }: KPICardProps) {
  return (
    <div 
      className="glass-card p-4 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={cn(
          'p-1.5 rounded-md',
          trend === 'up' ? 'bg-bullish/20 text-bullish' :
          trend === 'down' ? 'bg-bearish/20 text-bearish' :
          'bg-muted text-muted-foreground'
        )}>
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
        <div className="text-xs text-muted-foreground mt-1">{subValue}</div>
      )}
    </div>
  );
}

function KPISkeleton() {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="h-3 w-20 bg-muted rounded mb-3" />
      <div className="h-6 w-24 bg-muted rounded mb-1" />
      <div className="h-3 w-16 bg-muted rounded" />
    </div>
  );
}

export function KPIRow({ metrics, pair, loading }: KPIRowProps) {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => <KPISkeleton key={i} />)}
      </div>
    );
  }

  const formatRate = (rate: number) => {
    const decimals = pair.quote === 'JPY' || pair.quote === 'KRW' ? 2 : 4;
    return rate.toFixed(decimals);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <KPICard
        label="Current Rate"
        value={formatRate(metrics.currentRate)}
        subValue={`${pair.base}/${pair.quote}`}
        icon={<Activity className="w-3.5 h-3.5" />}
        delay={0}
      />
      
      <KPICard
        label="Daily Change"
        value={`${metrics.dailyChangePercent >= 0 ? '+' : ''}${metrics.dailyChangePercent.toFixed(2)}%`}
        subValue={`${metrics.dailyChange >= 0 ? '+' : ''}${formatRate(metrics.dailyChange)}`}
        icon={metrics.dailyChange >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        trend={metrics.dailyChange >= 0 ? 'up' : 'down'}
        delay={50}
      />
      
      <KPICard
        label="7-Day Change"
        value={`${metrics.weeklyChangePercent >= 0 ? '+' : ''}${metrics.weeklyChangePercent.toFixed(2)}%`}
        subValue={`${metrics.weeklyChange >= 0 ? '+' : ''}${formatRate(metrics.weeklyChange)}`}
        icon={metrics.weeklyChange >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        trend={metrics.weeklyChange >= 0 ? 'up' : 'down'}
        delay={100}
      />
      
      <KPICard
        label="7-Day MA"
        value={formatRate(metrics.ma7)}
        subValue={metrics.ma7 > metrics.ma30 ? '↑ Above 30d MA' : '↓ Below 30d MA'}
        icon={<LineChart className="w-3.5 h-3.5" />}
        trend={metrics.ma7 > metrics.ma30 ? 'up' : 'down'}
        delay={150}
      />
      
      <KPICard
        label="30-Day MA"
        value={formatRate(metrics.ma30)}
        subValue="Long-term trend"
        icon={<LineChart className="w-3.5 h-3.5" />}
        delay={200}
      />
      
      <KPICard
        label="14-Day Vol (σ)"
        value={`${(metrics.stdDev14 * 100).toFixed(2)}%`}
        subValue={`${metrics.volatilityLevel.charAt(0).toUpperCase() + metrics.volatilityLevel.slice(1)} volatility`}
        icon={<BarChart3 className="w-3.5 h-3.5" />}
        trend={metrics.volatilityLevel === 'high' ? 'down' : metrics.volatilityLevel === 'low' ? 'up' : 'neutral'}
        delay={250}
      />
    </div>
  );
}
