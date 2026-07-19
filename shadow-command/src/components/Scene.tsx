import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useGameStore } from '../state/gameStore';
import RegionTile from './RegionTile';
import StrikeEffect from './StrikeEffect';

export default function Scene() {
  const regions = useGameStore((s) => s.regions);
  const strikeVisuals = useGameStore((s) => s.strikeVisuals);
  const clearStrikeVisual = useGameStore((s) => s.clearStrikeVisual);
  const selectedRegionId = useGameStore((s) => s.selectedRegionId);
  const selectRegion = useGameStore((s) => s.selectRegion);

  return (
    <Canvas shadows camera={{ position: [0, 15, 13], fov: 40 }}>
      <color attach="background" args={['#141821']} />
      <fog attach="fog" args={['#141821', 20, 42]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[6, 14, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.06, 0]}
        receiveShadow
        onPointerMissed={() => selectRegion(null)}
      >
        <planeGeometry args={[44, 44]} />
        <meshStandardMaterial color="#1c2230" />
      </mesh>
      <gridHelper args={[44, 44, '#2a3244', '#232a3a']} position={[0, -0.055, 0]} />

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
        minDistance={6}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </Canvas>
  );
}
