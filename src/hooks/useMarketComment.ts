import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CurrencyPair } from '@/types/fx';
import { ToneAgentId, getAgentById } from '@/types/toneAgent';
import { FXCalendarEvent } from '@/types/calendar';

interface UseMarketCommentResult {
  comment: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const FALLBACK_COMMENTS: Record<ToneAgentId, string> = {
  pro: '시장 데이터를 분석 중입니다. 잠시 후 다시 시도해주세요.',
  cheerful: '✨ 잠깐만요! 시장 상황을 열심히 살펴보고 있어요~',
  dry: '서버가 잠시 바쁜 모양이네요. 뭐, 기다리죠.',
  professor: '현재 데이터 수집 중입니다. 학문적 분석에는 시간이 필요합니다.',
  zen: '시장도 쉬어가는 시간이 필요합니다. 호흡을 가다듬으세요.',
};

export function useMarketComment(
  pair: CurrencyPair,
  agentId: ToneAgentId,
  trend: number,
  events: FXCalendarEvent[]
): UseMarketCommentResult {
  const [comment, setComment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);
  const cacheRef = useRef<Map<string, { comment: string; timestamp: number }>>(new Map());

  const getCacheKey = useCallback(() => {
    return `${pair.base}-${pair.quote}-${agentId}-${trend}`;
  }, [pair.base, pair.quote, agentId, trend]);

  const fetchComment = useCallback(async () => {
    // Prevent concurrent requests
    if (isFetchingRef.current) {
      return;
    }

    const now = Date.now();
    const cacheKey = getCacheKey();
    
    // Check cache first (5 minute TTL)
    const cached = cacheRef.current.get(cacheKey);
    if (cached && now - cached.timestamp < 5 * 60 * 1000) {
      setComment(cached.comment);
      setError(null);
      return;
    }

    // Rate limit: minimum 10 seconds between requests to avoid hitting limits
    if (now - lastFetchRef.current < 10000) {
      // Use fallback while rate limited
      if (!comment) {
        setComment(FALLBACK_COMMENTS[agentId]);
      }
      return;
    }
    
    isFetchingRef.current = true;
    lastFetchRef.current = now;

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
        // Rate limit or payment error - use fallback
        const fallback = FALLBACK_COMMENTS[agentId];
        setComment(fallback);
        setError(null);
      } else if (data?.comment) {
        setComment(data.comment);
        cacheRef.current.set(cacheKey, { comment: data.comment, timestamp: now });
      }
    } catch (err) {
      console.error('Failed to fetch market comment:', err);
      // Use fallback on error
      setComment(FALLBACK_COMMENTS[agentId]);
      setError(null);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [pair.base, pair.quote, agentId, trend, events, getCacheKey, comment]);

  useEffect(() => {
    fetchComment();
  }, [fetchComment]);

  return { comment, loading, error, refetch: fetchComment };
}
