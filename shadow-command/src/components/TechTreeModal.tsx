import { TECH_TREE } from '../data/tech';
import { useGameStore } from '../state/gameStore';

export default function TechTreeModal() {
  const open = useGameStore((s) => s.techPanelOpen);
  const toggle = useGameStore((s) => s.toggleTechPanel);
  const unlockedTech = useGameStore((s) => s.unlockedTech);
  const unlockTech = useGameStore((s) => s.unlockTech);
  const resources = useGameStore((s) => s.resources);
  const gameOver = useGameStore((s) => s.gameOver);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={toggle}>
      <div className="modal tech-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tech-modal-header">
          <h1>Tech Tree</h1>
          <button className="mini-btn" onClick={toggle}>
            Close
          </button>
        </div>
        <div className="tech-grid">
          {TECH_TREE.map((node) => {
            const unlocked = unlockedTech.includes(node.id);
            const prereqsMet = node.prerequisites.every((p) => unlockedTech.includes(p));
            const affordable =
              resources.treasury >= (node.cost.treasury ?? 0) && resources.influence >= (node.cost.influence ?? 0);
            const canUnlock = !unlocked && prereqsMet && affordable && !gameOver;
            return (
              <div key={node.id} className={`tech-card tier-${node.tier} ${unlocked ? 'unlocked' : ''}`}>
                <div className="tech-card-tier">Tier {node.tier}</div>
                <h3>{node.name}</h3>
                <p>{node.description}</p>
                {node.prerequisites.length > 0 && (
                  <p className="tech-prereqs">
                    Requires: {node.prerequisites.map((p) => TECH_TREE.find((t) => t.id === p)?.name).join(', ')}
                  </p>
                )}
                <div className="tech-card-footer">
                  <span className="tech-cost">
                    {node.cost.treasury ? `${node.cost.treasury} Treasury ` : ''}
                    {node.cost.influence ? `${node.cost.influence} Influence` : ''}
                  </span>
                  {unlocked ? (
                    <span className="tech-unlocked-badge">Researched</span>
                  ) : (
                    <button className="mini-btn" disabled={!canUnlock} onClick={() => unlockTech(node.id)}>
                      {prereqsMet ? 'Research' : 'Locked'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
