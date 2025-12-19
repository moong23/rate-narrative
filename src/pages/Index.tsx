import { useState } from 'react';
import { Header } from '@/components/Header';
import { CurrencySelector } from '@/components/CurrencySelector';
import { KPIRow } from '@/components/KPIRow';
import { RateDisplay } from '@/components/RateDisplay';
import { PriceChart } from '@/components/PriceChart';
import { SignalDisplay } from '@/components/SignalDisplay';
import { NewsPanel } from '@/components/NewsPanel';
import { PDFExport } from '@/components/PDFExport';
import { useFXData } from '@/hooks/useFXData';
import { useSignals } from '@/hooks/useSignals';
import { generateMockNews } from '@/data/mockNews';
import { CurrencyPair, CURRENCY_PAIRS, TimeRange } from '@/types/fx';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>(CURRENCY_PAIRS[0]);
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  
  const { currentRate, historicalRates, kpiMetrics, loading, error, refetch } = useFXData(selectedPair, timeRange);
  const news = generateMockNews(selectedPair.id);
  const signal = useSignals(selectedPair, kpiMetrics, news);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <section className="mb-8 animate-fade-in" aria-labelledby="page-title">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div>
              <h1 id="page-title" className="text-3xl font-bold tracking-tight mb-2">
                Pick a pair. See what's moving it.
              </h1>
              <p className="text-muted-foreground max-w-xl">
                Real-time exchange rates with moving averages, volatility analysis, 
                and weighted trading signals based on trend and sentiment.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <PDFExport 
                pair={selectedPair}
                rate={currentRate}
                signal={signal}
                news={news}
                historicalRates={historicalRates}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={refetch}
                disabled={loading}
                aria-label="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          <CurrencySelector selected={selectedPair} onSelect={setSelectedPair} />
        </section>

        {/* Error State */}
        {error && (
          <div 
            className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" aria-hidden="true" />
            <span className="text-destructive">{error}. Couldn't fetch rates. Try again in 30s.</span>
          </div>
        )}

        {/* KPI Row */}
        <KPIRow metrics={kpiMetrics} pair={selectedPair} loading={loading} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Rate & Chart */}
          <section className="lg:col-span-2 space-y-6" aria-label="Price data">
            <RateDisplay rate={currentRate} loading={loading} />
            <PriceChart 
              data={historicalRates} 
              timeRange={timeRange} 
              onTimeRangeChange={setTimeRange}
              loading={loading}
            />
          </section>
          
          {/* Right Column - Signal & News */}
          <aside className="space-y-6" aria-label="Analysis and news">
            <SignalDisplay signal={signal} loading={loading} />
            <NewsPanel news={news} loading={loading} />
          </aside>
        </div>

        {/* Methodology */}
        <section className="mt-8 research-card p-6 animate-fade-in" aria-labelledby="methodology-title">
          <h2 id="methodology-title" className="text-xl font-semibold mb-4">Signal Methodology</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Formula</h3>
              <code className="block p-4 rounded-lg bg-muted/50 font-mono text-sm border border-border">
                Score = 0.6 × Trend + 0.4 × News − 0.2 × Vol
              </code>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Trend:</strong> +1 if 7d MA &gt; 30d MA, else -1</p>
              <p><strong>News:</strong> Average sentiment score (-1 to +1)</p>
              <p><strong>Vol:</strong> Penalty of 1 if 14d σ &gt; 1.5%</p>
              <p><strong>Signal:</strong> Long &gt;0.2 | Short &lt;-0.2 | Neutral</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border text-center" role="contentinfo">
          <p className="text-caption max-w-2xl mx-auto">
            <span className="text-primary font-medium">⚠️ Research Use Only:</span> This platform is designed for 
            educational and research purposes. The trading signals and analysis provided do not 
            constitute financial advice.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
