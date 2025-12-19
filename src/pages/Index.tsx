import { useState } from 'react';
import { Header } from '@/components/Header';
import { CurrencySelector } from '@/components/CurrencySelector';
import { RateDisplay } from '@/components/RateDisplay';
import { PriceChart } from '@/components/PriceChart';
import { SignalDisplay } from '@/components/SignalDisplay';
import { NewsPanel } from '@/components/NewsPanel';
import { PDFExport } from '@/components/PDFExport';
import { useFXData } from '@/hooks/useFXData';
import { useSignals } from '@/hooks/useSignals';
import { generateMockNews } from '@/data/mockNews';
import { CurrencyPair, CURRENCY_PAIRS, TimeRange } from '@/types/fx';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>(CURRENCY_PAIRS[0]);
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  
  const { currentRate, historicalRates, loading, error, refetch } = useFXData(selectedPair, timeRange);
  const news = generateMockNews(selectedPair.id);
  const signal = useSignals(selectedPair, historicalRates, news);

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
                Real-time exchange rates, trend analysis, and AI-powered trading signals. 
                Select a currency pair to explore insights.
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
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
            {error}
          </div>
        )}

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
