import type { EventLogEntry } from '../types';

export interface RandomEvent {
  id: string;
  weight: number;
  condition: (ctx: EventContext) => boolean;
  apply: (ctx: EventContext) => Omit<EventLogEntry, 'turn'>;
}

export interface EventContext {
  corruption: number;
  morale: number;
  heat: number;
  retaliationRisk: number;
  treasury: number;
  mutate: {
    treasury: (delta: number) => void;
    morale: (delta: number) => void;
    heat: (delta: number) => void;
    corruption: (delta: number) => void;
    influence: (delta: number) => void;
  };
}

export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: 'scandal',
    weight: 3,
    condition: (ctx) => ctx.corruption > 40,
    apply: (ctx) => {
      ctx.mutate.morale(-8);
      ctx.mutate.heat(4);
      return {
        headline: 'State Media: "Foreign-Backed Slander Campaign Fabricates Corruption Lies"',
        detail: 'A leaked ledger tying senior commanders to shell companies goes viral. Public Morale -8, Heat +4.',
        tone: 'disaster',
      };
    },
  },
  {
    id: 'defection',
    weight: 2,
    condition: (ctx) => ctx.morale < 45,
    apply: (ctx) => {
      ctx.mutate.heat(6);
      ctx.mutate.influence(-10);
      return {
        headline: 'Commander Vanishes Overnight, Resurfaces Giving Interviews Abroad',
        detail: 'A mid-ranking officer defects with operational details. Influence -10, Heat +6.',
        tone: 'warning',
      };
    },
  },
  {
    id: 'drone_shot_down',
    weight: 3,
    condition: () => true,
    apply: (ctx) => {
      ctx.mutate.heat(3);
      return {
        headline: '"Weather Balloon" Wreckage Photographed Over Rival Capital',
        detail: 'A reconnaissance drone is shot down and put on television. Heat +3.',
        tone: 'warning',
      };
    },
  },
  {
    id: 'protest_wave',
    weight: 3,
    condition: (ctx) => ctx.morale < 35,
    apply: (ctx) => {
      ctx.mutate.morale(-10);
      ctx.mutate.corruption(-5);
      return {
        headline: 'Marchers Fill City Squares; State TV Cuts to Cooking Show',
        detail: 'Nationwide protests erupt over living costs. Public Morale -10.',
        tone: 'disaster',
      };
    },
  },
  {
    id: 'peace_offer',
    weight: 2,
    condition: (ctx) => ctx.heat > 50,
    apply: (ctx) => {
      ctx.mutate.heat(-8);
      ctx.mutate.influence(5);
      return {
        headline: 'Back-Channel Envoy Spotted Boarding Unmarked Jet',
        detail: 'A discreet offer to de-escalate arrives through a third party. Heat -8, Influence +5.',
        tone: 'triumph',
      };
    },
  },
  {
    id: 'windfall',
    weight: 2,
    condition: () => true,
    apply: (ctx) => {
      ctx.mutate.treasury(60);
      return {
        headline: 'Oil Tanker "Administrative Delay" Nets Surprise Bonus',
        detail: 'A fortunate customs mixup pads the treasury. Treasury +60.',
        tone: 'triumph',
      };
    },
  },
  {
    id: 'assassination_attempt',
    weight: 1,
    condition: (ctx) => ctx.heat > 60,
    apply: (ctx) => {
      ctx.mutate.morale(-5);
      ctx.mutate.heat(5);
      return {
        headline: 'Convoy Survives "Isolated Incident"; Three Vehicles Now Scrap',
        detail: 'An assassination attempt fails but rattles the leadership. Morale -5, Heat +5.',
        tone: 'disaster',
      };
    },
  },
];

export function pickWeightedEvent(ctx: EventContext): RandomEvent | null {
  const eligible = RANDOM_EVENTS.filter((e) => e.condition(ctx));
  if (eligible.length === 0) return null;
  const totalWeight = eligible.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const event of eligible) {
    roll -= event.weight;
    if (roll <= 0) return event;
  }
  return eligible[eligible.length - 1];
}
