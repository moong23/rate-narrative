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
import { RefreshCw, AlertTriangle } from 'lucide-react';
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
      
      <main className="container mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <section className="mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                Currency Intelligence
              </h1>
              <p className="text-muted-foreground max-w-xl">
                Real-time exchange rates with 7d/30d moving averages, volatility analysis, 
                and weighted trading signals. Select a currency pair to explore.
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
                className={loading ? 'animate-spin' : ''}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <CurrencySelector selected={selectedPair} onSelect={setSelectedPair} />
        </section>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <span className="text-destructive">{error}</span>
          </div>
        )}

        {/* KPI Row */}
        <KPIRow metrics={kpiMetrics} pair={selectedPair} loading={loading} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Rate & Chart */}
          <div className="lg:col-span-2 space-y-6">
            <RateDisplay rate={currentRate} loading={loading} />
            <PriceChart 
              data={historicalRates} 
              timeRange={timeRange} 
              onTimeRangeChange={setTimeRange}
              loading={loading}
            />
          </div>
          
          {/* Right Column - Signal & News */}
          <div className="space-y-6">
            <SignalDisplay signal={signal} loading={loading} />
            <NewsPanel news={news} loading={loading} />
          </div>
        </div>

        {/* Signal Formula Explainer */}
        <section className="mt-8 glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Signal Methodology</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Formula</h4>
              <code className="block p-3 rounded-lg bg-muted/50 font-mono text-sm">
                Score = 0.6 × Trend + 0.4 × Sentiment − 0.2 × VolPenalty
              </code>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Trend:</strong> +1 if 7d MA &gt; 30d MA, else -1</p>
              <p><strong>Sentiment:</strong> Average news score (-1 to +1)</p>
              <p><strong>Vol Penalty:</strong> 1 if 14d σ &gt; 1.5%, else 0</p>
              <p><strong>Signal:</strong> Long if &gt;0.2, Short if &lt;-0.2, else Neutral</p>
            </div>
          </div>
        </section>

        {/* Footer Disclaimer */}
        <footer className="mt-12 pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            <span className="text-primary">⚠️ Research Use Only:</span> This platform is designed for 
            educational and research purposes. The trading signals and analysis provided do not 
            constitute financial advice. Always consult with a qualified financial advisor before 
            making investment decisions.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
