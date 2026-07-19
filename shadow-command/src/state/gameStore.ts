import { create } from 'zustand';
import type {
  Arsenal,
  EventLogEntry,
  Faction,
  FactionId,
  GameOverState,
  ProxyIntensity,
  Region,
  Resources,
  Sector,
  SectorId,
  StrikeVisualEvent,
} from '../types';
import { INITIAL_REGIONS } from '../data/regions';
import { pickWeightedEvent } from '../logic/events';
import { TECH_TREE, type TechId } from '../data/tech';
import { PROXY_INTENSITY_LABELS, SUPERPOWER_INTENSITY_LABELS } from '../types';

const REFORMIST_MIN_TURN = 10;
const REFORMIST_MIN_MORALE = 70;
const REFORMIST_MAX_CORRUPTION = 20;

const INITIAL_SECTORS: Sector[] = [
  { id: 'oil', name: 'Oil Ministry', assigned: false, incomePerTurn: 45, corruptionPerTurn: 6, moralePerTurn: -1 },
  { id: 'construction', name: 'Construction Conglomerates', assigned: false, incomePerTurn: 30, corruptionPerTurn: 5, moralePerTurn: -2 },
  { id: 'banking', name: 'Banking Sector', assigned: false, incomePerTurn: 35, corruptionPerTurn: 7, moralePerTurn: -1 },
  { id: 'bonyads', name: 'Bonyad Foundations', assigned: false, incomePerTurn: 25, corruptionPerTurn: 4, moralePerTurn: -1 },
];

const INITIAL_FACTIONS: Faction[] = [
  { id: 'clergy', name: 'Clergy Council', loyalty: 70 },
  { id: 'army', name: 'Regular Army', loyalty: 65 },
  { id: 'technocrats', name: 'Technocrats', loyalty: 60 },
];

const INITIAL_RESOURCES: Resources = {
  treasury: 200,
  influence: 40,
  morale: 65,
  heat: 15,
  corruption: 10,
  retaliationRisk: 0,
};

const INITIAL_ARSENAL: Arsenal = {
  missiles: 3,
  drones: 5,
  airDefense: 1,
};

const WIN_TURN_THRESHOLD = 30;
const WIN_CONTROL_THRESHOLD = 65; // average control share across proxy regions
const WIN_SUPERPOWER_THRESHOLD = 90; // destabilization needed for the superpower-humbled ending
const PROXY_INTENSITY_COST = [0, 15, 30, 55, 90]; // influence cost to move to this intensity level
// Meddling with a nuclear superpower costs far more and carries far higher
// blowback than a regional proxy front — see setProxyIntensity below.
const SUPERPOWER_INTENSITY_COST = [0, 40, 90, 160, 260];
const SUPERPOWER_ESCALATION_HEADLINES: Record<number, string> = {
  0: 'Operation Quietly Shelved; No One Ever Notices',
  1: 'Obscure Podcast Network Receives Mysterious New Sponsor',
  2: 'Trending Hashtag Blames Foreign Meddling — Accurately, For Once',
  3: 'Voting Machine Vendor Issues Statement Insisting Everything Is Fine',
  4: 'Multiple Cable News Panels Declare Unrelated National Emergencies Simultaneously',
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

interface GameState {
  turn: number;
  resources: Resources;
  sectors: Sector[];
  factions: Faction[];
  regions: Region[];
  arsenal: Arsenal;
  siphonActive: boolean;
  eventLog: EventLogEntry[];
  gameOver: GameOverState | null;
  selectedRegionId: string | null;
  selectedWeapon: 'missile' | 'drone';
  strikeVisuals: StrikeVisualEvent[];
  negativeTreasuryStreak: number;
  unlockedTech: TechId[];
  techPanelOpen: boolean;

  selectRegion: (id: string | null) => void;
  toggleTechPanel: () => void;
  unlockTech: (id: TechId) => void;
  dismantleNetwork: () => void;
  toggleSector: (id: SectorId) => void;
  toggleSiphon: () => void;
  investInPublicServices: () => void;
  appeaseFaction: (id: FactionId) => void;
  setProxyIntensity: (regionId: string, intensity: ProxyIntensity) => void;
  buildArsenal: (type: 'missile' | 'drone', qty: number) => void;
  buildAirDefense: () => void;
  setSelectedWeapon: (weapon: 'missile' | 'drone') => void;
  launchStrike: (targetRegionId: string) => void;
  negotiateDeescalation: () => void;
  clearStrikeVisual: (id: string) => void;
  endTurn: () => void;
  resetGame: () => void;
}

function pushLog(log: EventLogEntry[], turn: number, entry: Omit<EventLogEntry, 'turn'>): EventLogEntry[] {
  const next = [...log, { turn, ...entry }];
  return next.slice(-30);
}

function checkGameOver(resources: Resources, factions: Faction[], negativeStreak: number): GameOverState | null {
  if (resources.morale <= 0) {
    return { over: true, won: false, endingType: 'collapse', reason: 'Mass uprising: Public Morale collapsed to zero. The regime falls.' };
  }
  const collapsedFaction = factions.find((f) => f.loyalty <= 0);
  if (collapsedFaction) {
    return { over: true, won: false, endingType: 'collapse', reason: `${collapsedFaction.name} withdraws support entirely. Tanks roll on the palace.` };
  }
  if (resources.heat >= 100) {
    return { over: true, won: false, endingType: 'collapse', reason: 'International Heat maxed out: a coalition intervention removes the regime.' };
  }
  if (negativeStreak >= 3) {
    return { over: true, won: false, endingType: 'collapse', reason: 'Total economic strangulation: the treasury has been insolvent for too long.' };
  }
  return null;
}

function hasTech(unlockedTech: TechId[], id: TechId): boolean {
  return unlockedTech.includes(id);
}

export const useGameStore = create<GameState>((set) => ({
  turn: 1,
  resources: { ...INITIAL_RESOURCES },
  sectors: INITIAL_SECTORS.map((s) => ({ ...s })),
  factions: INITIAL_FACTIONS.map((f) => ({ ...f })),
  regions: INITIAL_REGIONS.map((r) => ({ ...r })),
  arsenal: { ...INITIAL_ARSENAL },
  siphonActive: false,
  eventLog: [
    { turn: 0, headline: 'Command Assumed', detail: 'You have taken the reins. The nation awaits your "guidance."', tone: 'triumph' },
  ],
  gameOver: null,
  selectedRegionId: null,
  selectedWeapon: 'missile',
  strikeVisuals: [],
  negativeTreasuryStreak: 0,
  unlockedTech: [],
  techPanelOpen: false,

  selectRegion: (id) => set({ selectedRegionId: id }),
  toggleTechPanel: () => set((state) => ({ techPanelOpen: !state.techPanelOpen })),

  unlockTech: (id) =>
    set((state) => {
      if (state.gameOver) return state;
      if (state.unlockedTech.includes(id)) return state;
      const node = TECH_TREE.find((t) => t.id === id);
      if (!node) return state;
      if (!node.prerequisites.every((p) => state.unlockedTech.includes(p))) return state;
      const treasuryCost = node.cost.treasury ?? 0;
      const influenceCost = node.cost.influence ?? 0;
      if (state.resources.treasury < treasuryCost || state.resources.influence < influenceCost) return state;
      return {
        resources: {
          ...state.resources,
          treasury: state.resources.treasury - treasuryCost,
          influence: state.resources.influence - influenceCost,
        },
        unlockedTech: [...state.unlockedTech, id],
        eventLog: pushLog(state.eventLog, state.turn, {
          headline: `Research Complete: ${node.name}`,
          detail: node.description,
          tone: 'triumph',
        }),
      };
    }),

  dismantleNetwork: () =>
    set((state) => {
      if (state.gameOver) return state;
      const eligible =
        state.turn >= REFORMIST_MIN_TURN &&
        state.resources.morale >= REFORMIST_MIN_MORALE &&
        state.resources.corruption <= REFORMIST_MAX_CORRUPTION;
      if (!eligible) return state;
      return {
        gameOver: {
          over: true,
          won: true,
          endingType: 'reformist',
          reason:
            'You dissolve the patronage networks, stand down the proxy fronts, and hand power to a civilian transitional council. State media has no idea how to spin this one.',
        },
      };
    }),

  toggleSector: (id) =>
    set((state) => {
      if (state.gameOver) return state;
      return {
        sectors: state.sectors.map((s) => (s.id === id ? { ...s, assigned: !s.assigned } : s)),
      };
    }),

  toggleSiphon: () =>
    set((state) => {
      if (state.gameOver) return state;
      return { siphonActive: !state.siphonActive };
    }),

  investInPublicServices: () =>
    set((state) => {
      if (state.gameOver) return state;
      const cost = 50;
      if (state.resources.treasury < cost) return state;
      return {
        resources: {
          ...state.resources,
          treasury: state.resources.treasury - cost,
          morale: clamp(state.resources.morale + 8),
          corruption: clamp(state.resources.corruption - 3),
        },
        eventLog: pushLog(state.eventLog, state.turn, {
          headline: 'State Unveils New Public Clinic; Ribbon-Cutting Draws Modest Crowd',
          detail: `Spent ${cost} Treasury on public services. Morale +8, Corruption -3.`,
          tone: 'triumph',
        }),
      };
    }),

  appeaseFaction: (id) =>
    set((state) => {
      if (state.gameOver) return state;
      const cost = 40;
      if (state.resources.treasury < cost) return state;
      return {
        resources: { ...state.resources, treasury: state.resources.treasury - cost },
        factions: state.factions.map((f) => (f.id === id ? { ...f, loyalty: clamp(f.loyalty + 20) } : f)),
        eventLog: pushLog(state.eventLog, state.turn, {
          headline: `Gifts and Titles Shower the ${state.factions.find((f) => f.id === id)?.name}`,
          detail: `Spent ${cost} Treasury to shore up loyalty.`,
          tone: 'triumph',
        }),
      };
    }),

  setProxyIntensity: (regionId, intensity) =>
    set((state) => {
      if (state.gameOver) return state;
      const region = state.regions.find((r) => r.id === regionId);
      if (!region || region.isHomeland) return state;

      const costTable = region.isSuperpower ? SUPERPOWER_INTENSITY_COST : PROXY_INTENSITY_COST;
      const currentCost = costTable[region.intensity];
      const targetCost = costTable[intensity];
      const discount = hasTech(state.unlockedTech, 'asymmetric') ? 0.8 : 1;
      const delta = Math.round((targetCost - currentCost) * discount);
      if (delta > 0 && state.resources.influence < delta) return state;
      const controlDelta = (intensity - region.intensity) * 6;

      // Meddling with a superpower carries immediate, sharp blowback risk —
      // regional proxy escalation doesn't touch Heat/Retaliation at all.
      const intensityIncrease = Math.max(0, intensity - region.intensity);
      const heatBump = region.isSuperpower ? intensityIncrease * 10 : 0;
      const riskBump = region.isSuperpower ? intensityIncrease * 12 : 0;

      const headline = region.isSuperpower
        ? SUPERPOWER_ESCALATION_HEADLINES[intensity]
        : `Operations Escalate in ${region.name}`;
      const detail = region.isSuperpower
        ? `Subversion posture set to ${SUPERPOWER_INTENSITY_LABELS[intensity]}.` +
          (heatBump ? ` Heat +${heatBump}, Retaliation Risk +${riskBump}.` : '')
        : `Proxy posture set to ${PROXY_INTENSITY_LABELS[intensity]}.`;

      return {
        resources: {
          ...state.resources,
          influence: state.resources.influence - delta,
          heat: clamp(state.resources.heat + heatBump, 0, 999),
          retaliationRisk: clamp(state.resources.retaliationRisk + riskBump, 0, 999),
        },
        regions: state.regions.map((r) =>
          r.id === regionId
            ? { ...r, intensity, controlShare: clamp(r.controlShare + controlDelta) }
            : r
        ),
        eventLog: pushLog(state.eventLog, state.turn, {
          headline,
          detail,
          tone: intensity >= 3 ? 'warning' : 'triumph',
        }),
      };
    }),

  buildArsenal: (type, qty) =>
    set((state) => {
      if (state.gameOver) return state;
      const unitCost = type === 'missile' ? 70 : 35;
      const totalCost = unitCost * qty;
      if (state.resources.treasury < totalCost) return state;
      return {
        resources: { ...state.resources, treasury: state.resources.treasury - totalCost },
        arsenal: {
          ...state.arsenal,
          missiles: type === 'missile' ? state.arsenal.missiles + qty : state.arsenal.missiles,
          drones: type === 'drone' ? state.arsenal.drones + qty : state.arsenal.drones,
        },
        eventLog: pushLog(state.eventLog, state.turn, {
          headline: type === 'missile' ? 'New Ballistic Missiles Roll Off the Line' : 'Drone Swarm Assembled in Secret Hangar',
          detail: `Produced ${qty} ${type}(s) for ${totalCost} Treasury.`,
          tone: 'triumph',
        }),
      };
    }),

  buildAirDefense: () =>
    set((state) => {
      if (state.gameOver) return state;
      const cost = 60 * (state.arsenal.airDefense + 1);
      if (state.resources.treasury < cost || state.arsenal.airDefense >= 5) return state;
      return {
        resources: { ...state.resources, treasury: state.resources.treasury - cost },
        arsenal: { ...state.arsenal, airDefense: state.arsenal.airDefense + 1 },
        eventLog: pushLog(state.eventLog, state.turn, {
          headline: 'New Air Defense Battery Declared "Impenetrable"',
          detail: `Air Defense level now ${state.arsenal.airDefense + 1}.`,
          tone: 'triumph',
        }),
      };
    }),

  setSelectedWeapon: (weapon) => set({ selectedWeapon: weapon }),

  launchStrike: (targetRegionId) =>
    set((state) => {
      if (state.gameOver) return state;
      const weapon = state.selectedWeapon;
      const available = weapon === 'missile' ? state.arsenal.missiles : state.arsenal.drones;
      if (available <= 0) return state;
      const target = state.regions.find((r) => r.id === targetRegionId);
      const homeland = state.regions.find((r) => r.isHomeland);
      // The superpower region is only ever engaged via the covert subversion
      // ladder (setProxyIntensity) — never a kinetic strike target.
      if (!target || !homeland || target.isSuperpower) return state;

      let controlGain = weapon === 'missile' ? 15 + Math.round(Math.random() * 10) : 8 + Math.round(Math.random() * 8);
      let heatGain = weapon === 'missile' ? 12 + Math.round(Math.random() * 6) : 6 + Math.round(Math.random() * 5);
      const riskGain = weapon === 'missile' ? 18 + Math.round(Math.random() * 10) : 9 + Math.round(Math.random() * 6);

      if (hasTech(state.unlockedTech, 'cyber')) heatGain = Math.round(heatGain * 0.8);
      if (hasTech(state.unlockedTech, 'advancedGuidance')) {
        controlGain = Math.round(controlGain * 1.5);
        heatGain = Math.round(heatGain * 0.8);
      }

      const visual: StrikeVisualEvent = {
        id: `${Date.now()}-${Math.random()}`,
        from: homeland.position,
        to: target.position,
        weapon,
      };

      return {
        arsenal: {
          ...state.arsenal,
          missiles: weapon === 'missile' ? state.arsenal.missiles - 1 : state.arsenal.missiles,
          drones: weapon === 'drone' ? state.arsenal.drones - 1 : state.arsenal.drones,
        },
        regions: state.regions.map((r) =>
          r.id === targetRegionId ? { ...r, controlShare: clamp(r.controlShare + controlGain) } : r
        ),
        resources: {
          ...state.resources,
          heat: clamp(state.resources.heat + heatGain, 0, 999),
          retaliationRisk: clamp(state.resources.retaliationRisk + riskGain, 0, 999),
        },
        strikeVisuals: [...state.strikeVisuals, visual],
        eventLog: pushLog(state.eventLog, state.turn, {
          headline: weapon === 'missile'
            ? `Ballistic Strike Levels Target Near ${target.name}`
            : `Drone Swarm Blankets Skies Over ${target.name}`,
          detail: `Control +${controlGain}%, Heat +${heatGain}, Retaliation Risk +${riskGain}.`,
          tone: 'warning',
        }),
      };
    }),

  negotiateDeescalation: () =>
    set((state) => {
      if (state.gameOver) return state;
      const cost = 25;
      if (state.resources.influence < cost) return state;
      return {
        resources: {
          ...state.resources,
          influence: state.resources.influence - cost,
          heat: clamp(state.resources.heat - 15, 0, 999),
          retaliationRisk: clamp(state.resources.retaliationRisk - 20, 0, 999),
        },
        eventLog: pushLog(state.eventLog, state.turn, {
          headline: 'Foreign Ministry Issues Statement of "Constructive Dialogue"',
          detail: `Spent ${cost} Influence to cool tensions. Heat -15, Retaliation Risk -20.`,
          tone: 'triumph',
        }),
      };
    }),

  clearStrikeVisual: (id) =>
    set((state) => ({ strikeVisuals: state.strikeVisuals.filter((v) => v.id !== id) })),

  endTurn: () =>
    set((state) => {
      if (state.gameOver) return state;

      let treasury = state.resources.treasury;
      let corruption = state.resources.corruption;
      let morale = state.resources.morale;
      let heat = state.resources.heat;
      let influence = state.resources.influence;
      let retaliationRisk = state.resources.retaliationRisk;

      // Base oil income throttled by sanctions heat.
      const baseIncome = 80 * (1 - clamp(heat, 0, 100) / 200);
      treasury += baseIncome;
      influence += 8;

      // Sector patronage.
      for (const sector of state.sectors) {
        if (sector.assigned) {
          treasury += sector.incomePerTurn;
          corruption = clamp(corruption + sector.corruptionPerTurn);
          morale = clamp(morale + sector.moralePerTurn);
        }
      }

      // Siphoning.
      if (state.siphonActive) {
        treasury += 40;
        corruption = clamp(corruption + 5);
        morale = clamp(morale - 5);
      }

      // Faction loyalty decay.
      const factions = state.factions.map((f) => ({ ...f, loyalty: clamp(f.loyalty - 2) }));

      // Corruption-driven unrest pressure.
      const disinformationFactor = hasTech(state.unlockedTech, 'disinformation') ? 0.7 : 1;
      const unrestPressure = (Math.max(0, corruption - 50) * 0.15 + Math.max(0, 50 - morale) * 0.05) * disinformationFactor;
      morale = clamp(morale - unrestPressure);

      // Retaliation risk resolves into an actual retaliatory strike if too high.
      const airDefenseGridBonus = hasTech(state.unlockedTech, 'airDefenseGrid') ? 2 : 0;
      let retaliationLog: Omit<EventLogEntry, 'turn'> | null = null;
      if (retaliationRisk >= 70) {
        const mitigation = (state.arsenal.airDefense + airDefenseGridBonus) * 8;
        const impact = Math.max(0, retaliationRisk - mitigation);
        treasury -= impact * 0.8;
        morale = clamp(morale - impact * 0.15);
        retaliationLog = {
          headline: 'Retaliatory Strike Reported on State-Owned Infrastructure',
          detail: `Air defenses intercepted some of it. Treasury and Morale took a hit (impact ${Math.round(impact)}).`,
          tone: 'disaster',
        };
        retaliationRisk = 10;
      } else {
        retaliationRisk = clamp(retaliationRisk - 5, 0, 999);
      }

      // Contested provinces drift slightly toward player based on intensity.
      const regions = state.regions.map((r) => {
        if (r.isHomeland) return r;
        const drift = (r.intensity - 1) * 1.5 + (Math.random() - 0.5) * 2;
        return { ...r, controlShare: clamp(r.controlShare + drift) };
      });

      let eventLog = pushLog(state.eventLog, state.turn, {
        headline: 'Turn Concludes',
        detail: `Treasury ${treasury >= 0 ? '+' : ''}${Math.round(treasury - state.resources.treasury)} net this turn.`,
        tone: 'triumph',
      });

      if (retaliationLog) {
        eventLog = pushLog(eventLog, state.turn, retaliationLog);
      }

      // Random event.
      const randomEvent = pickWeightedEvent({
        corruption,
        morale,
        heat,
        retaliationRisk,
        treasury,
        mutate: {
          treasury: (d) => {
            treasury += d;
          },
          morale: (d) => {
            morale = clamp(morale + d);
          },
          heat: (d) => {
            heat = clamp(heat + d, 0, 999);
          },
          corruption: (d) => {
            corruption = clamp(corruption + d);
          },
          influence: (d) => {
            influence += d;
          },
        },
      });
      if (randomEvent) {
        const entry = randomEvent.apply({
          corruption,
          morale,
          heat,
          retaliationRisk,
          treasury,
          mutate: {
            treasury: (d) => {
              treasury += d;
            },
            morale: (d) => {
              morale = clamp(morale + d);
            },
            heat: (d) => {
              heat = clamp(heat + d, 0, 999);
            },
            corruption: (d) => {
              corruption = clamp(corruption + d);
            },
            influence: (d) => {
              influence += d;
            },
          },
        });
        eventLog = pushLog(eventLog, state.turn, entry);
      }

      const negativeTreasuryStreak = treasury < 0 ? state.negativeTreasuryStreak + 1 : 0;

      const nextResources: Resources = {
        treasury,
        influence,
        morale,
        heat: clamp(heat, 0, 999),
        corruption,
        retaliationRisk,
      };

      const nextTurn = state.turn + 1;

      const gameOver =
        checkGameOver(nextResources, factions, negativeTreasuryStreak) ??
        (() => {
          const proxyRegions = regions.filter((r) => !r.isHomeland && !r.isSuperpower);
          const avgControl = proxyRegions.reduce((sum, r) => sum + r.controlShare, 0) / proxyRegions.length;
          if (nextTurn > WIN_TURN_THRESHOLD && avgControl >= WIN_CONTROL_THRESHOLD) {
            return { over: true, won: true, endingType: 'hegemony' as const, reason: `Regional hegemony achieved: ${Math.round(avgControl)}% average control after ${nextTurn - 1} turns.` };
          }
          if (treasury >= 2000) {
            return { over: true, won: true, endingType: 'economic' as const, reason: 'Economic dominance achieved: the treasury overflows beyond 2000.' };
          }
          const usa = regions.find((r) => r.isSuperpower);
          if (usa && usa.controlShare >= WIN_SUPERPOWER_THRESHOLD) {
            return {
              over: true,
              won: true,
              endingType: 'superpowerHumbled' as const,
              reason: `The Great Satan spends more energy investigating itself than governing: ${Math.round(usa.controlShare)}% destabilized after ${nextTurn - 1} turns. Its allies stop returning your calls out of pure secondhand embarrassment.`,
            };
          }
          return null;
        })();

      return {
        turn: nextTurn,
        resources: nextResources,
        factions,
        regions,
        eventLog,
        negativeTreasuryStreak,
        gameOver,
      };
    }),

  resetGame: () =>
    set({
      turn: 1,
      resources: { ...INITIAL_RESOURCES },
      sectors: INITIAL_SECTORS.map((s) => ({ ...s })),
      factions: INITIAL_FACTIONS.map((f) => ({ ...f })),
      regions: INITIAL_REGIONS.map((r) => ({ ...r })),
      arsenal: { ...INITIAL_ARSENAL },
      siphonActive: false,
      eventLog: [
        { turn: 0, headline: 'Command Assumed', detail: 'You have taken the reins. The nation awaits your "guidance."', tone: 'triumph' },
      ],
      gameOver: null,
      selectedRegionId: null,
      selectedWeapon: 'missile',
      strikeVisuals: [],
      negativeTreasuryStreak: 0,
      unlockedTech: [],
      techPanelOpen: false,
    }),
}));

export const PROXY_INTENSITY_COSTS = PROXY_INTENSITY_COST;
export const SUPERPOWER_INTENSITY_COSTS = SUPERPOWER_INTENSITY_COST;
export { WIN_TURN_THRESHOLD, WIN_CONTROL_THRESHOLD, REFORMIST_MIN_TURN, REFORMIST_MIN_MORALE, REFORMIST_MAX_CORRUPTION };
export const getRegionById = (regions: Region[], id: string | null) => regions.find((r) => r.id === id) ?? null;
