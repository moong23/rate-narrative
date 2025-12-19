import { Activity, TrendingUp } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50" role="banner">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">FX Insights</h1>
              <p className="text-xs text-muted-foreground">Real-time currency intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-caption">
              <TrendingUp className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>Live Data</span>
              <span className="w-2 h-2 bg-bullish rounded-full animate-pulse" aria-label="Live indicator" />
            </div>
            
            <div className="px-3 py-1.5 rounded-md bg-muted/50 text-caption font-medium" role="note">
              Research Only
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
