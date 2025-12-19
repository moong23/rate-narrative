import { Activity, TrendingUp, FileText } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center glow-primary">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-bullish rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">FX Insights</h1>
              <p className="text-xs text-muted-foreground">Real-time currency intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Live Data</span>
              <span className="w-2 h-2 bg-bullish rounded-full animate-pulse" />
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Research Use Only</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
