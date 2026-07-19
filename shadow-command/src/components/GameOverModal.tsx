import { useGameStore } from '../state/gameStore';

export default function GameOverModal() {
  const gameOver = useGameStore((s) => s.gameOver);
  const turn = useGameStore((s) => s.turn);
  const resetGame = useGameStore((s) => s.resetGame);

  if (!gameOver) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h1>{gameOver.won ? 'Victory' : 'Regime Collapse'}</h1>
        <p className="modal-turn">Survived {turn - 1} turns</p>
        <p>{gameOver.reason}</p>
        <button className="strike-btn" onClick={resetGame}>
          Start New Regime
        </button>
      </div>
    </div>
  );
}
