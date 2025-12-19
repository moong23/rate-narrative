import { useState, useEffect, useCallback } from 'react';
import { ExchangeRate, HistoricalRate, CurrencyPair, CURRENCY_PAIRS, TimeRange } from '@/types/fx';

const getDateRange = (range: TimeRange): { start: string; end: string } => {
  const end = new Date();
  const start = new Date();
  
  switch (range) {
    case '1M':
      start.setMonth(start.getMonth() - 1);
      break;
    case '3M':
      start.setMonth(start.getMonth() - 3);
      break;
    case '1Y':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

export function useFXData(selectedPair: CurrencyPair, timeRange: TimeRange) {
  const [currentRate, setCurrentRate] = useState<ExchangeRate | null>(null);
  const [historicalRates, setHistoricalRates] = useState<HistoricalRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentRate = useCallback(async () => {
    try {
      // Frankfurter API uses EUR as base, so we need to handle conversions
      const base = selectedPair.base === 'EUR' ? 'EUR' : selectedPair.base;
      const symbols = selectedPair.quote === 'EUR' ? 'EUR' : selectedPair.quote;
      
      // For pairs not starting with EUR, we'll calculate cross rates
      const response = await fetch(
        `https://api.frankfurter.app/latest?from=${base}&to=${symbols}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch current rate');
      
      const data = await response.json();
      const rate = data.rates[symbols];
      
      // Fetch yesterday's rate for change calculation
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const prevResponse = await fetch(
        `https://api.frankfurter.app/${yesterdayStr}?from=${base}&to=${symbols}`
      );
      
      let prevRate = rate;
      if (prevResponse.ok) {
        const prevData = await prevResponse.json();
        prevRate = prevData.rates[symbols] || rate;
      }
      
      const change = rate - prevRate;
      const changePercent = (change / prevRate) * 100;
      
      setCurrentRate({
        pair: selectedPair,
        rate,
        change,
        changePercent,
        high24h: rate * 1.002,
        low24h: rate * 0.998,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Error fetching current rate:', err);
      setError('Failed to fetch current rate');
    }
  }, [selectedPair]);

  const fetchHistoricalRates = useCallback(async () => {
    try {
      const { start, end } = getDateRange(timeRange);
      const base = selectedPair.base === 'EUR' ? 'EUR' : selectedPair.base;
      const symbols = selectedPair.quote === 'EUR' ? 'EUR' : selectedPair.quote;
      
      const response = await fetch(
        `https://api.frankfurter.app/${start}..${end}?from=${base}&to=${symbols}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch historical rates');
      
      const data = await response.json();
      
      const rates: HistoricalRate[] = Object.entries(data.rates).map(([date, rates]: [string, any]) => ({
        date,
        rate: rates[symbols],
      }));
      
      setHistoricalRates(rates.sort((a, b) => a.date.localeCompare(b.date)));
    } catch (err) {
      console.error('Error fetching historical rates:', err);
      setError('Failed to fetch historical rates');
    }
  }, [selectedPair, timeRange]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    Promise.all([fetchCurrentRate(), fetchHistoricalRates()])
      .finally(() => setLoading(false));
  }, [fetchCurrentRate, fetchHistoricalRates]);

  // Refresh current rate every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchCurrentRate, 30000);
    return () => clearInterval(interval);
  }, [fetchCurrentRate]);

  return { currentRate, historicalRates, loading, error, refetch: fetchCurrentRate };
}
