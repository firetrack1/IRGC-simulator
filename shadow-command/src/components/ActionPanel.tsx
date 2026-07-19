import { useGameStore } from '../state/gameStore';

export default function ActionPanel() {
  const sectors = useGameStore((s) => s.sectors);
  const factions = useGameStore((s) => s.factions);
  const siphonActive = useGameStore((s) => s.siphonActive);
  const resources = useGameStore((s) => s.resources);
  const arsenal = useGameStore((s) => s.arsenal);
  const toggleSector = useGameStore((s) => s.toggleSector);
  const toggleSiphon = useGameStore((s) => s.toggleSiphon);
  const appeaseFaction = useGameStore((s) => s.appeaseFaction);
  const buildArsenal = useGameStore((s) => s.buildArsenal);
  const buildAirDefense = useGameStore((s) => s.buildAirDefense);
  const negotiateDeescalation = useGameStore((s) => s.negotiateDeescalation);
  const gameOver = useGameStore((s) => s.gameOver);

  return (
    <div className="panel action-panel">
      <h2>Patronage Networks</h2>
      <p className="panel-hint">Corruption: {Math.round(resources.corruption)}%</p>
      {sectors.map((sector) => (
        <button
          key={sector.id}
          className={`toggle-row ${sector.assigned ? 'active' : ''}`}
          disabled={!!gameOver}
          onClick={() => toggleSector(sector.id)}
        >
          <span>{sector.name}</span>
          <span className="toggle-row-stats">
            +{sector.incomePerTurn} Treasury / +{sector.corruptionPerTurn} Corruption
          </span>
        </button>
      ))}
      <button
        className={`toggle-row ${siphonActive ? 'active' : ''}`}
        disabled={!!gameOver}
        onClick={toggleSiphon}
      >
        <span>Siphon State Revenue</span>
        <span className="toggle-row-stats">+40 Treasury / −5 Morale</span>
      </button>

      <h2>Faction Balance</h2>
      {factions.map((f) => (
        <div key={f.id} className="faction-row">
          <div className="faction-row-label">
            <span>{f.name}</span>
            <span>{Math.round(f.loyalty)}%</span>
          </div>
          <div className="resource-bar-track small">
            <div
              className="resource-bar-fill"
              style={{ width: `${f.loyalty}%`, background: f.loyalty > 30 ? '#4f8a5b' : '#c94f4f' }}
            />
          </div>
          <button className="mini-btn" disabled={!!gameOver || resources.treasury < 40} onClick={() => appeaseFaction(f.id)}>
            Appease (40 Treasury)
          </button>
        </div>
      ))}

      <h2>Arsenal Production</h2>
      <div className="arsenal-row">
        <span>Missiles: {arsenal.missiles}</span>
        <button className="mini-btn" disabled={!!gameOver || resources.treasury < 70} onClick={() => buildArsenal('missile', 1)}>
          Build (70)
        </button>
      </div>
      <div className="arsenal-row">
        <span>Drones: {arsenal.drones}</span>
        <button className="mini-btn" disabled={!!gameOver || resources.treasury < 35} onClick={() => buildArsenal('drone', 1)}>
          Build (35)
        </button>
      </div>
      <div className="arsenal-row">
        <span>Air Defense: Lv {arsenal.airDefense}</span>
        <button
          className="mini-btn"
          disabled={!!gameOver || arsenal.airDefense >= 5 || resources.treasury < 60 * (arsenal.airDefense + 1)}
          onClick={buildAirDefense}
        >
          Upgrade ({60 * (arsenal.airDefense + 1)})
        </button>
      </div>

      <h2>Diplomacy</h2>
      <p className="panel-hint">Retaliation Risk: {Math.round(resources.retaliationRisk)}%</p>
      <button className="mini-btn wide" disabled={!!gameOver || resources.influence < 25} onClick={negotiateDeescalation}>
        Back-Channel Negotiation (25 Influence)
      </button>
    </div>
  );
}
