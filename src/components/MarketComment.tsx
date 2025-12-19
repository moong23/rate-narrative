import { MessageCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ToneAgentModal } from './ToneAgentModal';
import { useMarketComment } from '@/hooks/useMarketComment';
import { CurrencyPair } from '@/types/fx';
import { ToneAgentId, getAgentById } from '@/types/toneAgent';
import { FXCalendarEvent } from '@/types/calendar';

interface MarketCommentProps {
  pair: CurrencyPair;
  agentId: ToneAgentId;
  onAgentChange: (id: ToneAgentId) => void;
  trend: number;
  events: FXCalendarEvent[];
}

export function MarketComment({ pair, agentId, onAgentChange, trend, events }: MarketCommentProps) {
  const { comment, loading, error, refetch } = useMarketComment(pair, agentId, trend, events);
  const agent = getAgentById(agentId);

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
      <div className="flex-shrink-0">
        <MessageCircle className="w-5 h-5 text-primary" aria-hidden="true" />
      </div>
      
      <div className="flex-1 min-w-0">
        {loading ? (
          <Skeleton className="h-5 w-full max-w-md" />
        ) : error ? (
          <span className="text-muted-foreground text-sm italic">
            {agent.emoji} Market insights loading...
          </span>
        ) : comment ? (
          <p className="text-sm text-foreground leading-relaxed">
            {comment}
          </p>
        ) : (
          <span className="text-muted-foreground text-sm italic">
            {agent.emoji} Analyzing market mood...
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={refetch}
          disabled={loading}
          className="h-8 w-8"
          aria-label="Refresh comment"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        <ToneAgentModal selectedAgent={agentId} onSelect={onAgentChange} />
      </div>
    </div>
  );
}
