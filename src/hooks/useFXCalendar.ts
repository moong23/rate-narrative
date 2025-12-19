import { useState, useEffect, useCallback } from 'react';
import { FXCalendarEvent, FXCalendarAPIResponse } from '@/types/calendar';
import { CurrencyPair } from '@/types/fx';

const FALLBACK_EVENTS: FXCalendarEvent[] = [
  { currency: 'USD', title: 'Fed Chair Powell Speaks', impact: 'High', time: '14:00' },
  { currency: 'USD', title: 'Initial Jobless Claims', impact: 'Medium', time: '13:30' },
  { currency: 'EUR', title: 'ECB President Lagarde Speaks', impact: 'High', time: '15:00' },
  { currency: 'JPY', title: 'BoJ Interest Rate Decision', impact: 'High', time: '03:00' },
  { currency: 'GBP', title: 'UK Retail Sales', impact: 'Medium', time: '07:00' },
  { currency: 'KRW', title: 'BoK Base Rate', impact: 'High', time: '09:00' },
];

const API_ENDPOINTS = [
  'https://www.jblanked.com/news/api/mql5/calendar/today/',
  'https://www.jblanked.com/news/api/forex/calendar/today/',
];

const normalizeEvent = (raw: FXCalendarAPIResponse): FXCalendarEvent | null => {
  const currency = raw.currency;
  const title = raw.title || raw.event;
  const impact = raw.impact;
  const time = raw.time;

  if (!currency || !title) return null;

  const normalizedImpact: 'High' | 'Medium' | 'Low' = 
    impact?.toLowerCase() === 'high' ? 'High' :
    impact?.toLowerCase() === 'medium' ? 'Medium' : 'Low';

  return {
    currency: currency.toUpperCase(),
    title,
    impact: normalizedImpact,
    time: time || '--:--',
  };
};

export function useFXCalendar(pair: CurrencyPair) {
  const [events, setEvents] = useState<FXCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const relevantCurrencies = [pair.base, pair.quote];

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    setError(null);

    for (const url of API_ENDPOINTS) {
      try {
        const response = await fetch(url, { 
          signal: AbortSignal.timeout(10000),
        });
        
        if (response.ok) {
          const data: FXCalendarAPIResponse[] = await response.json();
          
          if (Array.isArray(data) && data.length > 0) {
            const normalized = data
              .map(normalizeEvent)
              .filter((e): e is FXCalendarEvent => e !== null)
              .filter(e => relevantCurrencies.includes(e.currency))
              .sort((a, b) => {
                // Sort by impact (High first), then by time
                const impactOrder = { High: 0, Medium: 1, Low: 2 };
                if (impactOrder[a.impact] !== impactOrder[b.impact]) {
                  return impactOrder[a.impact] - impactOrder[b.impact];
                }
                return a.time.localeCompare(b.time);
              })
              .slice(0, 6);

            if (normalized.length > 0) {
              setEvents(normalized);
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn(`FX Calendar fetch failed for ${url}:`, err);
        continue;
      }
    }

    // Fallback to mock data
    console.log('Using fallback FX calendar data');
    const fallback = FALLBACK_EVENTS
      .filter(e => relevantCurrencies.includes(e.currency))
      .slice(0, 6);
    setEvents(fallback);
    setError('Using cached events');
    setLoading(false);
  }, [pair.base, pair.quote]);

  useEffect(() => {
    fetchCalendar();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchCalendar, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchCalendar]);

  return { events, loading, error, refetch: fetchCalendar };
}
