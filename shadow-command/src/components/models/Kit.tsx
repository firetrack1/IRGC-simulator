// A small library of procedural low-poly "kitbash" pieces used to dress up
// regions on the map: no external model assets, just composed primitives
// with silhouettes distinct enough to read as building/silo/tower/rig/ship.
import type { JSX } from 'react';

type GroupProps = JSX.IntrinsicElements['group'];

export function Building({ height = 0.5, width = 0.16, color = '#cfd6e0', ...props }: GroupProps & { height?: number; width?: number; color?: string }) {
  return (
    <group {...props}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width, height, width]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, height + width * 0.35, 0]} castShadow>
        <coneGeometry args={[width * 0.75, width * 0.7, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export function ControlTower({ height = 1.4, ...props }: GroupProps & { height?: number }) {
  return (
    <group {...props}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, height, 8]} />
        <meshStandardMaterial color="#e8d68a" />
      </mesh>
      <mesh position={[0, height + 0.08, 0]} castShadow>
        <sphereGeometry args={[0.13, 10, 8]} />
        <meshStandardMaterial color="#f4e6a8" emissive="#c9a227" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

export function MissileSilo({ height = 0.45, ...props }: GroupProps & { height?: number }) {
  return (
    <group {...props}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.13, height, 10]} />
        <meshStandardMaterial color="#5a5f6b" />
      </mesh>
      <mesh position={[0, height + 0.05, 0]} castShadow>
        <coneGeometry args={[0.06, 0.22, 10]} />
        <meshStandardMaterial color="#ff6b3d" emissive="#ff6b3d" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

export function RadarDish({ height = 0.3, ...props }: GroupProps & { height?: number }) {
  return (
    <group {...props}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, height, 6]} />
        <meshStandardMaterial color="#8a90a0" />
      </mesh>
      <mesh position={[0, height, 0]} rotation={[0.5, 0, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.02, 0.05, 12, 1, true]} />
        <meshStandardMaterial color="#cfd6e0" side={2} />
      </mesh>
    </group>
  );
}

export function WatchTower({ height = 0.6, ...props }: GroupProps & { height?: number }) {
  return (
    <group {...props}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[0.07, height, 0.07]} />
        <meshStandardMaterial color="#4a4030" />
      </mesh>
      <mesh position={[0, height + 0.05, 0]} castShadow>
        <boxGeometry args={[0.16, 0.1, 0.16]} />
        <meshStandardMaterial color="#6b5d3f" />
      </mesh>
    </group>
  );
}

export function OilDerrick({ height = 0.5, ...props }: GroupProps & { height?: number }) {
  return (
    <group {...props}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <coneGeometry args={[0.14, height, 4, 1, true]} />
        <meshStandardMaterial color="#3a3f4a" wireframe />
      </mesh>
      <mesh position={[0, height * 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, height * 0.3, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

export function BankVault({ size = 0.22, ...props }: GroupProps & { size?: number }) {
  return (
    <group {...props}>
      <mesh position={[0, size / 2, 0]} castShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color="#8a7a3f" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, size + 0.03, 0]}>
        <cylinderGeometry args={[size * 0.5, size * 0.5, 0.04, 8]} />
        <meshStandardMaterial color="#c9a227" />
      </mesh>
    </group>
  );
}

export function BonyadDome({ size = 0.2, ...props }: GroupProps & { size?: number }) {
  return (
    <group {...props}>
      <mesh position={[0, size * 0.4, 0]} castShadow>
        <cylinderGeometry args={[size * 0.5, size * 0.55, size * 0.8, 8]} />
        <meshStandardMaterial color="#e8d68a" />
      </mesh>
      <mesh position={[0, size * 0.9, 0]} castShadow>
        <sphereGeometry args={[size * 0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4f8a5b" />
      </mesh>
    </group>
  );
}

export function NavalUnit({ scale = 1, ...props }: GroupProps & { scale?: number }) {
  return (
    <group {...props} scale={scale}>
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.5, 0.1, 0.16]} />
        <meshStandardMaterial color="#3a4048" />
      </mesh>
      <mesh position={[0.1, 0.16, 0]} castShadow>
        <boxGeometry args={[0.12, 0.14, 0.12]} />
        <meshStandardMaterial color="#4a505a" />
      </mesh>
      <mesh position={[0.1, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.16, 6]} />
        <meshStandardMaterial color="#2a2e34" />
      </mesh>
    </group>
  );
}
