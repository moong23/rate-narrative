import { HistoricalRate, TimeRange } from '@/types/fx';
import { cn } from '@/lib/utils';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface PriceChartProps {
  data: HistoricalRate[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  loading: boolean;
}

const timeRanges: TimeRange[] = ['1M', '3M', '1Y'];

export function PriceChart({ data, timeRange, onTimeRangeChange, loading }: PriceChartProps) {
  const isPositiveTrend = data.length >= 2 && data[data.length - 1].rate >= data[0].rate;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timeRange === '1Y') {
      return date.toLocaleDateString('en-US', { month: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="research-card p-3 text-sm" role="tooltip">
          <p className="text-caption mb-1">
            {new Date(label).toLocaleDateString('en-US', { 
              weekday: 'short',
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <p className="font-mono font-semibold">
            {payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 4 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <article className="research-card p-6 animate-fade-in" role="region" aria-label="Price history chart">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Price History</h2>
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1" role="tablist" aria-label="Time range selection">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              role="tab"
              aria-selected={timeRange === range}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
                timeRange === range
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[280px]" role="img" aria-label={`Price chart showing ${timeRange} data with ${isPositiveTrend ? 'positive' : 'negative'} trend`}>
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label="Loading chart" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositiveTrend ? '#10B981' : '#EF4444'}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositiveTrend ? '#10B981' : '#EF4444'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="hsl(215, 14%, 64%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['dataMin', 'dataMax']}
                stroke="hsl(215, 14%, 64%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toFixed(2)}
                width={56}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={isPositiveTrend ? '#10B981' : '#EF4444'}
                strokeWidth={2}
                fill="url(#colorRate)"
                animationDuration={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
}
