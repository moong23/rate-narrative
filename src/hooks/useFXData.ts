import { useState, useEffect, useCallback } from 'react';
import { ExchangeRate, HistoricalRate, CurrencyPair, TimeRange, KPIMetrics, VOLATILITY_THRESHOLDS } from '@/types/fx';

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

const calculateMovingAverage = (rates: HistoricalRate[], days: number): number => {
  if (rates.length < days) return rates[rates.length - 1]?.rate || 0;
  const recentRates = rates.slice(-days);
  return recentRates.reduce((sum, r) => sum + r.rate, 0) / recentRates.length;
};

const calculateStdDev = (rates: HistoricalRate[], days: number): number => {
  if (rates.length < days) return 0;
  const recentRates = rates.slice(-days);
  
  // Calculate daily returns
  const returns: number[] = [];
  for (let i = 1; i < recentRates.length; i++) {
    returns.push((recentRates[i].rate - recentRates[i - 1].rate) / recentRates[i - 1].rate);
  }
  
  if (returns.length === 0) return 0;
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  return Math.sqrt(variance);
};

const getVolatilityLevel = (stdDev: number): 'low' | 'medium' | 'high' => {
  if (stdDev < VOLATILITY_THRESHOLDS.low) return 'low';
  if (stdDev > VOLATILITY_THRESHOLDS.high) return 'high';
  return 'medium';
};

export function useFXData(selectedPair: CurrencyPair, timeRange: TimeRange) {
  const [currentRate, setCurrentRate] = useState<ExchangeRate | null>(null);
  const [historicalRates, setHistoricalRates] = useState<HistoricalRate[]>([]);
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistoricalRates = useCallback(async () => {
    try {
      // Always fetch at least 45 days for MA calculations
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 45);
      
      const base = selectedPair.base === 'EUR' ? 'EUR' : selectedPair.base;
      const symbols = selectedPair.quote === 'EUR' ? 'EUR' : selectedPair.quote;
      
      const response = await fetch(
        `https://api.frankfurter.app/${start.toISOString().split('T')[0]}..${end.toISOString().split('T')[0]}?from=${base}&to=${symbols}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch historical rates');
      
      const data = await response.json();
      
      const rates: HistoricalRate[] = Object.entries(data.rates).map(([date, rates]: [string, any]) => ({
        date,
        rate: rates[symbols],
      }));
      
      return rates.sort((a, b) => a.date.localeCompare(b.date));
    } catch (err) {
      console.error('Error fetching historical rates:', err);
      throw err;
    }
  }, [selectedPair]);

  const calculateKPIs = useCallback((rates: HistoricalRate[]): KPIMetrics | null => {
    if (rates.length < 2) return null;
    
    const currentRate = rates[rates.length - 1].rate;
    const yesterdayRate = rates[rates.length - 2]?.rate || currentRate;
    const weekAgoRate = rates[rates.length - 8]?.rate || currentRate;
    
    const dailyChange = currentRate - yesterdayRate;
    const dailyChangePercent = (dailyChange / yesterdayRate) * 100;
    
    const weeklyChange = currentRate - weekAgoRate;
    const weeklyChangePercent = (weeklyChange / weekAgoRate) * 100;
    
    const ma7 = calculateMovingAverage(rates, 7);
    const ma30 = calculateMovingAverage(rates, 30);
    const stdDev14 = calculateStdDev(rates, 14);
    
    return {
      currentRate,
      dailyChange,
      dailyChangePercent,
      weeklyChange,
      weeklyChangePercent,
      ma7,
      ma30,
      stdDev14,
      volatilityLevel: getVolatilityLevel(stdDev14),
    };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allRates = await fetchHistoricalRates();
      
      // Filter rates based on selected time range for display
      const { start } = getDateRange(timeRange);
      const displayRates = allRates.filter(r => r.date >= start);
      setHistoricalRates(displayRates);
      
      // Calculate KPIs from full data
      const kpis = calculateKPIs(allRates);
      setKpiMetrics(kpis);
      
      if (kpis && allRates.length > 0) {
        const latestRate = allRates[allRates.length - 1];
        const yesterdayRate = allRates[allRates.length - 2];
        const weekAgoRate = allRates[allRates.length - 8];
        
        setCurrentRate({
          pair: selectedPair,
          rate: latestRate.rate,
          change: kpis.dailyChange,
          changePercent: kpis.dailyChangePercent,
          change7d: kpis.weeklyChange,
          change7dPercent: kpis.weeklyChangePercent,
          high24h: latestRate.rate * 1.002,
          low24h: latestRate.rate * 0.998,
          timestamp: new Date(),
        });
      }
    } catch (err) {
      setError('Failed to fetch FX data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedPair, timeRange, fetchHistoricalRates, calculateKPIs]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh data every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { 
    currentRate, 
    historicalRates, 
    kpiMetrics,
    loading, 
    error, 
    refetch: fetchData 
  };
}
