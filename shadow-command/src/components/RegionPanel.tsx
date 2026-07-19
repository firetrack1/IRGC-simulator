import { PROXY_INTENSITY_LABELS } from '../types';
import type { ProxyIntensity } from '../types';
import { PROXY_INTENSITY_COSTS, useGameStore } from '../state/gameStore';

const INTENSITY_LEVELS: ProxyIntensity[] = [0, 1, 2, 3, 4];

export default function RegionPanel() {
  const selectedRegionId = useGameStore((s) => s.selectedRegionId);
  const regions = useGameStore((s) => s.regions);
  const setProxyIntensity = useGameStore((s) => s.setProxyIntensity);
  const arsenal = useGameStore((s) => s.arsenal);
  const selectedWeapon = useGameStore((s) => s.selectedWeapon);
  const setSelectedWeapon = useGameStore((s) => s.setSelectedWeapon);
  const launchStrike = useGameStore((s) => s.launchStrike);
  const resources = useGameStore((s) => s.resources);
  const gameOver = useGameStore((s) => s.gameOver);

  const region = regions.find((r) => r.id === selectedRegionId);

  if (!region) {
    return (
      <div className="panel region-panel">
        <h2>Region Intel</h2>
        <p className="panel-hint">Select a country on the map to view details and issue orders.</p>
      </div>
    );
  }

  const availableWeapon = selectedWeapon === 'missile' ? arsenal.missiles : arsenal.drones;

  return (
    <div className="panel region-panel">
      <h2>{region.name}</h2>
      {region.isHomeland ? (
        <p className="panel-hint">This is the homeland. All strikes launch from here.</p>
      ) : (
        <>
          <p className="panel-hint">Control Share: {Math.round(region.controlShare)}%</p>
          <div className="resource-bar-track">
            <div className="resource-bar-fill" style={{ width: `${region.controlShare}%`, background: '#c9a227' }} />
          </div>
          <p className="panel-hint">Supply Lines: {region.supplyLineIntact ? 'Intact' : 'Severed'}</p>

          <h3>Proxy Escalation</h3>
          <div className="intensity-ladder">
            {INTENSITY_LEVELS.map((level) => (
              <button
                key={level}
                className={`intensity-step ${region.intensity === level ? 'active' : ''}`}
                disabled={!!gameOver}
                onClick={() => setProxyIntensity(region.id, level)}
              >
                <span>{PROXY_INTENSITY_LABELS[level]}</span>
                <span className="intensity-cost">{PROXY_INTENSITY_COSTS[level]} Inf.</span>
              </button>
            ))}
          </div>

          <h3>Strike This Region</h3>
          <div className="weapon-select">
            <button
              className={`toggle-row small ${selectedWeapon === 'missile' ? 'active' : ''}`}
              onClick={() => setSelectedWeapon('missile')}
            >
              Missile ({arsenal.missiles})
            </button>
            <button
              className={`toggle-row small ${selectedWeapon === 'drone' ? 'active' : ''}`}
              onClick={() => setSelectedWeapon('drone')}
            >
              Drone ({arsenal.drones})
            </button>
          </div>
          <button
            className="strike-btn"
            disabled={!!gameOver || availableWeapon <= 0}
            onClick={() => launchStrike(region.id)}
          >
            Launch {selectedWeapon} Strike
          </button>
          <p className="panel-hint">Heat: {Math.round(resources.heat)}% · Retaliation Risk: {Math.round(resources.retaliationRisk)}%</p>
        </>
      )}
    </div>
  );
}
