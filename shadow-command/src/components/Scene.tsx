import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useGameStore } from '../state/gameStore';
import RegionTile from './RegionTile';
import StrikeEffect from './StrikeEffect';
import WorldMap from './WorldMap';

export default function Scene() {
  const regions = useGameStore((s) => s.regions);
  const strikeVisuals = useGameStore((s) => s.strikeVisuals);
  const clearStrikeVisual = useGameStore((s) => s.clearStrikeVisual);
  const selectedRegionId = useGameStore((s) => s.selectedRegionId);
  const selectRegion = useGameStore((s) => s.selectRegion);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 30, 24], fov: 38 }}
      onPointerMissed={() => selectRegion(null)}
    >
      <color attach="background" args={['#0d1520']} />
      <fog attach="fog" args={['#0d1520', 70, 320]} />
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[10, 26, 8]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
      />

      <WorldMap />

      {regions.map((r) => (
        <RegionTile
          key={r.id}
          region={r}
          selected={r.id === selectedRegionId}
          onSelect={() => selectRegion(r.id)}
        />
      ))}

      {strikeVisuals.map((v) => (
        <StrikeEffect key={v.id} event={v} onComplete={() => clearStrikeVisual(v.id)} />
      ))}

      <OrbitControls
        enablePan
        minDistance={8}
        maxDistance={260}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </Canvas>
  );
}
