import { CurrencyPair, CURRENCY_PAIRS } from '@/types/fx';
import { cn } from '@/lib/utils';

interface CurrencySelectorProps {
  selected: CurrencyPair;
  onSelect: (pair: CurrencyPair) => void;
}

export function CurrencySelector({ selected, onSelect }: CurrencySelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CURRENCY_PAIRS.map((pair) => (
        <button
          key={pair.id}
          onClick={() => onSelect(pair)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200',
            'hover:border-primary/50 hover:bg-primary/5',
            selected.id === pair.id
              ? 'border-primary bg-primary/10 text-foreground shadow-lg glow-primary'
              : 'border-border/50 bg-card/50 text-muted-foreground'
          )}
        >
          <span className="text-lg">{pair.flag}</span>
          <span className="font-medium">{pair.base}/{pair.quote}</span>
        </button>
      ))}
    </div>
  );
}
