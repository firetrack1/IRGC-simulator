export type TechId = 'asymmetric' | 'cyber' | 'airDefenseGrid' | 'disinformation' | 'advancedGuidance';

export interface TechNode {
  id: TechId;
  name: string;
  tier: 1 | 2 | 3;
  description: string;
  cost: { treasury?: number; influence?: number };
  prerequisites: TechId[];
}

export const TECH_TREE: TechNode[] = [
  {
    id: 'asymmetric',
    name: 'Asymmetric Warfare Doctrine',
    tier: 1,
    description: 'Proxy escalation costs 20% less Influence across every front.',
    cost: { influence: 60 },
    prerequisites: [],
  },
  {
    id: 'cyber',
    name: 'Cyber Operations Unit',
    tier: 1,
    description: 'Strikes generate 20% less International Heat — harder to attribute.',
    cost: { treasury: 80, influence: 20 },
    prerequisites: [],
  },
  {
    id: 'airDefenseGrid',
    name: 'Integrated Air Defense Grid',
    tier: 2,
    description: 'Adds +2 effective Air Defense levels when mitigating retaliation.',
    cost: { treasury: 150 },
    prerequisites: ['cyber'],
  },
  {
    id: 'disinformation',
    name: 'Disinformation Network',
    tier: 2,
    description: 'Cuts corruption-driven unrest pressure on Public Morale by 30%.',
    cost: { influence: 100 },
    prerequisites: ['asymmetric'],
  },
  {
    id: 'advancedGuidance',
    name: 'Advanced Missile Guidance',
    tier: 3,
    description: 'Strikes gain 50% more Control Share and 20% less Heat than before.',
    cost: { treasury: 250, influence: 100 },
    prerequisites: ['airDefenseGrid', 'disinformation'],
  },
];
