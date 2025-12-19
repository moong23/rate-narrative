import { FXCalendarEvent } from '@/types/calendar';
import { CurrencyPair } from '@/types/fx';
import { cn } from '@/lib/utils';
import { Calendar, Clock } from 'lucide-react';

interface FXCalendarPanelProps {
  events: FXCalendarEvent[];
  pair: CurrencyPair;
  loading: boolean;
}

const ImpactIndicator = ({ impact }: { impact: FXCalendarEvent['impact'] }) => {
  const config = {
    High: { color: 'bg-bearish', label: '🔴' },
    Medium: { color: 'bg-warning', label: '🟡' },
    Low: { color: 'bg-muted-foreground', label: '⚪' },
  };

  return (
    <span 
      className="text-sm" 
      title={`${impact} impact`}
      aria-label={`${impact} impact event`}
    >
      {config[impact].label}
    </span>
  );
};

export function FXCalendarPanel({ events, pair, loading }: FXCalendarPanelProps) {
  if (loading) {
    return (
      <aside className="research-card p-6 animate-pulse" aria-label="FX calendar loading">
        <div className="h-5 w-36 bg-muted rounded mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-3">
            <div className="h-4 w-full bg-muted rounded" />
          </div>
        ))}
      </aside>
    );
  }

  return (
    <aside className="research-card p-6 animate-fade-in" role="complementary" aria-label="Economic calendar">
      <h2 className="text-xl font-semibold flex items-center gap-2 mb-5">
        <Calendar className="w-5 h-5 text-primary" aria-hidden="true" />
        📰 오늘 환율 이벤트
      </h2>

      <p className="text-caption mb-4">
        Today's events for {pair.base}/{pair.quote}
      </p>

      <div className="space-y-2">
        {events.map((event, index) => (
          <div
            key={`${event.currency}-${event.title}-${index}`}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors",
              `animate-fade-in delay-${(index + 1) * 50}`
            )}
            role="listitem"
          >
            <ImpactIndicator impact={event.impact} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-primary">{event.currency}</span>
                <span className="truncate">{event.title}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-caption shrink-0">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <time>{event.time}</time>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
          <p>No events scheduled</p>
        </div>
      )}

      <p className="text-caption mt-4 text-center opacity-70">
        🔴 High | 🟡 Medium impact
      </p>
    </aside>
  );
}
