export type ToneAgentId = 'pro' | 'cheerful' | 'dry' | 'professor' | 'zen';

export interface ToneAgent {
  id: ToneAgentId;
  name: string;
  emoji: string;
  description: string;
  style: string;
}

export const TONE_AGENTS: ToneAgent[] = [
  {
    id: 'pro',
    name: 'Analyst Pro',
    emoji: '📊',
    description: 'Calm, concise, Bloomberg-style',
    style: 'Write in a neutral analyst tone, like a Bloomberg FX strategist. Keep it professional and data-driven.'
  },
  {
    id: 'cheerful',
    name: 'Coach Sunny',
    emoji: '☀️',
    description: 'Upbeat, simple, emoji-rich',
    style: 'Write in a friendly, emoji-rich tone for a curious beginner. Be encouraging and positive.'
  },
  {
    id: 'dry',
    name: 'Sarcastic Bot',
    emoji: '🙄',
    description: 'Deadpan, cynical',
    style: 'Write in a sarcastic, blunt tone with short sentences. Be witty but not mean.'
  },
  {
    id: 'professor',
    name: 'FX Scholar',
    emoji: '🎓',
    description: 'Formal, detailed',
    style: 'Write like a macroeconomics professor—formal and precise. Include a brief educational insight.'
  },
  {
    id: 'zen',
    name: 'Calm Monk',
    emoji: '🧘',
    description: 'Meditative, balanced',
    style: 'Write like a calm, meditative monk observing the market. Be philosophical and balanced.'
  }
];

export const getAgentById = (id: ToneAgentId): ToneAgent => {
  return TONE_AGENTS.find(agent => agent.id === id) || TONE_AGENTS[0];
};
