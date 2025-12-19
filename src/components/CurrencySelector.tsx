import { CurrencyPair, CURRENCY_PAIRS } from '@/types/fx';
import { cn } from '@/lib/utils';

interface CurrencySelectorProps {
  selected: CurrencyPair;
  onSelect: (pair: CurrencyPair) => void;
}

export function CurrencySelector({ selected, onSelect }: CurrencySelectorProps) {
  return (
    <nav aria-label="Currency pair selection" className="flex flex-wrap gap-2">
      {CURRENCY_PAIRS.map((pair) => (
        <button
          key={pair.id}
          onClick={() => onSelect(pair)}
          aria-pressed={selected.id === pair.id}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200',
            'hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary',
            selected.id === pair.id
              ? 'border-primary bg-primary/10 text-foreground shadow-sm'
              : 'border-border bg-card text-muted-foreground'
          )}
        >
          <span className="text-lg" aria-hidden="true">{pair.flag}</span>
          <span className="font-medium">{pair.base}/{pair.quote}</span>
        </button>
      ))}
    </nav>
  );
}
