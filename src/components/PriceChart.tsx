import { HistoricalRate, TimeRange } from '@/types/fx';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
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
        <div className="glass-card p-3 border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">
            {new Date(label).toLocaleDateString('en-US', { 
              weekday: 'short',
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <p className="font-mono font-semibold text-foreground">
            {payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 4 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Price History</h3>
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
                timeRange === range
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositiveTrend ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositiveTrend ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="hsl(215, 20%, 35%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['dataMin', 'dataMax']}
                stroke="hsl(215, 20%, 35%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toFixed(2)}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={isPositiveTrend ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'}
                strokeWidth={2}
                fill="url(#colorRate)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
