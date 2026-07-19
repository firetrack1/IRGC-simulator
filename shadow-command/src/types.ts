export type FactionId = 'clergy' | 'army' | 'technocrats';

export type SectorId = 'oil' | 'construction' | 'banking' | 'bonyads';

export interface Sector {
  id: SectorId;
  name: string;
  assigned: boolean;
  incomePerTurn: number;
  corruptionPerTurn: number;
  moralePerTurn: number;
}

export interface Faction {
  id: FactionId;
  name: string;
  loyalty: number;
}

export type ProxyIntensity = 0 | 1 | 2 | 3 | 4;

export const PROXY_INTENSITY_LABELS: Record<ProxyIntensity, string> = {
  0: 'No Presence',
  1: 'Political Support',
  2: 'Covert Funding',
  3: 'Arming Militias',
  4: 'Active Conflict',
};

export interface Region {
  id: string;
  name: string;
  position: [number, number];
  intensity: ProxyIntensity;
  controlShare: number;
  supplyLineIntact: boolean;
  isHomeland?: boolean;
}

export interface Arsenal {
  missiles: number;
  drones: number;
  airDefense: number;
}

export interface Resources {
  treasury: number;
  influence: number;
  morale: number;
  heat: number;
  corruption: number;
  retaliationRisk: number;
}

export interface EventLogEntry {
  turn: number;
  headline: string;
  detail: string;
  tone: 'triumph' | 'warning' | 'disaster';
}

export type EndingType = 'hegemony' | 'economic' | 'reformist' | 'collapse';

export interface GameOverState {
  over: boolean;
  won: boolean;
  reason: string;
  endingType: EndingType;
}

export interface StrikeVisualEvent {
  id: string;
  from: [number, number];
  to: [number, number];
  weapon: 'missile' | 'drone';
}
