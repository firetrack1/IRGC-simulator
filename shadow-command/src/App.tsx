import './App.css';
import Scene from './components/Scene';
import HUD from './components/HUD';
import ActionPanel from './components/ActionPanel';
import RegionPanel from './components/RegionPanel';
import EventTicker from './components/EventTicker';
import GameOverModal from './components/GameOverModal';

function App() {
  return (
    <div className="app-root">
      <HUD />
      <div className="app-body">
        <ActionPanel />
        <div className="map-viewport">
          <Scene />
        </div>
        <RegionPanel />
      </div>
      <EventTicker />
      <GameOverModal />
    </div>
  );
}

export default App;
