import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { TONE_AGENTS, ToneAgentId, getAgentById } from '@/types/toneAgent';
import { cn } from '@/lib/utils';

interface ToneAgentModalProps {
  selectedAgent: ToneAgentId;
  onSelect: (id: ToneAgentId) => void;
}

export function ToneAgentModal({ selectedAgent, onSelect }: ToneAgentModalProps) {
  const currentAgent = getAgentById(selectedAgent);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Change tone agent"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">{currentAgent.emoji} {currentAgent.name}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🎭 Choose Your Market Commentator
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          {TONE_AGENTS.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onSelect(agent.id)}
              className={cn(
                'w-full text-left p-4 rounded-lg border transition-all duration-200',
                'hover:border-primary/40 hover:bg-primary/5',
                selectedAgent === agent.id
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-card'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{agent.emoji}</span>
                <div className="flex-1">
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-sm text-muted-foreground">{agent.description}</div>
                </div>
                {selectedAgent === agent.id && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
