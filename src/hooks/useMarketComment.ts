import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CurrencyPair } from '@/types/fx';
import { ToneAgentId } from '@/types/toneAgent';
import { FXCalendarEvent } from '@/types/calendar';

interface UseMarketCommentResult {
  comment: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMarketComment(
  pair: CurrencyPair,
  agentId: ToneAgentId,
  trend: number,
  events: FXCalendarEvent[]
): UseMarketCommentResult {
  const [comment, setComment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComment = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const eventTitles = events
        .filter(e => e.impact === 'High')
        .slice(0, 3)
        .map(e => e.title);

      const { data, error: fnError } = await supabase.functions.invoke('market-comment', {
        body: {
          pairName: `${pair.base}/${pair.quote}`,
          trend,
          events: eventTitles,
          agentId
        }
      });

      if (fnError) {
        throw fnError;
      }

      if (data?.error) {
        setError(data.error);
        setComment(null);
      } else {
        setComment(data?.comment || null);
      }
    } catch (err) {
      console.error('Failed to fetch market comment:', err);
      setError('Failed to generate comment');
      setComment(null);
    } finally {
      setLoading(false);
    }
  }, [pair.base, pair.quote, agentId, trend, events]);

  useEffect(() => {
    fetchComment();
  }, [fetchComment]);

  return { comment, loading, error, refetch: fetchComment };
}
