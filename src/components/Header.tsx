import { Activity, TrendingUp, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function Header() {
  const { theme, setTheme } = useTheme();

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
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            
            <div className="px-3 py-1.5 rounded-md bg-muted/50 text-caption font-medium" role="note">
              Research Only
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
