import { useGameStore } from '../state/gameStore';
import { TECH_TREE } from '../data/tech';

function ResourceBar({
  label,
  value,
  max,
  color,
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="resource-bar">
      <div className="resource-bar-label">
        <span>{label}</span>
        <span className="resource-bar-value">
          {Math.round(value)}
          {suffix ?? ''}
        </span>
      </div>
      <div className="resource-bar-track">
        <div className="resource-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function HUD() {
  const resources = useGameStore((s) => s.resources);
  const arsenal = useGameStore((s) => s.arsenal);
  const factions = useGameStore((s) => s.factions);
  const turn = useGameStore((s) => s.turn);
  const endTurn = useGameStore((s) => s.endTurn);
  const gameOver = useGameStore((s) => s.gameOver);
  const toggleTechPanel = useGameStore((s) => s.toggleTechPanel);
  const unlockedTech = useGameStore((s) => s.unlockedTech);

  const militaryAssets = arsenal.missiles + arsenal.drones;

  return (
    <div className="hud-top">
      <div className="hud-title">
        <span className="hud-title-main">SHADOW COMMAND</span>
        <span className="hud-title-sub">Turn {turn}</span>
      </div>
      <div className="hud-bars">
        <ResourceBar label="Treasury" value={resources.treasury} max={1000} color="#c9a227" />
        <ResourceBar label="Influence" value={resources.influence} max={200} color="#5b8ac9" />
        <ResourceBar label="Military Assets" value={militaryAssets} max={40} color="#8a5bc9" />
        <ResourceBar label="Loyalty" value={avgLoyalty(factions)} max={100} color="#4f8a5b" suffix="%" />
        <ResourceBar label="Public Morale" value={resources.morale} max={100} color="#3ba0a0" suffix="%" />
        <ResourceBar label="International Heat" value={resources.heat} max={100} color="#c94f4f" suffix="%" />
      </div>
      <button className="tech-tree-btn" onClick={toggleTechPanel}>
        Tech Tree ({unlockedTech.length}/{TECH_TREE.length})
      </button>
      <button className="end-turn-btn" onClick={endTurn} disabled={!!gameOver}>
        End Turn ➜
      </button>
    </div>
  );
}

function avgLoyalty(factions: { loyalty: number }[]): number {
  if (factions.length === 0) return 0;
  return factions.reduce((sum, f) => sum + f.loyalty, 0) / factions.length;
}
