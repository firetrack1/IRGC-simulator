import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { Region } from '../types';

const RIVAL_COLOR = new THREE.Color('#8a3a3a');
const PLAYER_COLOR = new THREE.Color('#c9a227');
const HOMELAND_COLOR = new THREE.Color('#2f6b4f');

function controlColor(controlShare: number, isHomeland?: boolean): THREE.Color {
  if (isHomeland) return HOMELAND_COLOR.clone();
  return RIVAL_COLOR.clone().lerp(PLAYER_COLOR, controlShare / 100);
}

interface Props {
  region: Region;
  selected: boolean;
  onSelect: () => void;
}

export default function RegionTile({ region, selected, onSelect }: Props) {
  const [x, z] = region.position;
  const groupRef = useRef<THREE.Group>(null);
  const color = useMemo(() => controlColor(region.controlShare, region.isHomeland), [region.controlShare, region.isHomeland]);

  const buildingCount = region.isHomeland ? 4 : 1 + region.intensity;
  const buildings = useMemo(() => {
    const rand = mulberry32(hashCode(region.id));
    return Array.from({ length: buildingCount }, (_, i) => {
      const angle = (i / buildingCount) * Math.PI * 2 + rand();
      const radius = 0.35 + rand() * 0.35;
      const h = 0.3 + rand() * (region.isHomeland ? 1.4 : 0.6 + region.intensity * 0.25);
      return {
        pos: [Math.cos(angle) * radius, h / 2, Math.sin(angle) * radius] as [number, number, number],
        h,
        w: 0.18 + rand() * 0.15,
      };
    });
  }, [buildingCount, region.id, region.isHomeland, region.intensity]);

  useFrame((_, delta) => {
    if (groupRef.current && selected) {
      groupRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <group position={[x, 0, z]}>
      <RoundedBox
        args={[1.6, 0.12, 1.6]}
        radius={0.08}
        smoothness={2}
        position={[0, 0.06, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <meshStandardMaterial color={color} emissive={selected ? '#ffffff' : '#000000'} emissiveIntensity={selected ? 0.15 : 0} />
      </RoundedBox>

      <group ref={groupRef} position={[0, 0.12, 0]}>
        {buildings.map((b, i) => (
          <mesh key={i} position={b.pos} castShadow>
            <boxGeometry args={[b.w, b.h, b.w]} />
            <meshStandardMaterial color={region.isHomeland ? '#e8d68a' : '#cfd6e0'} />
          </mesh>
        ))}
      </group>

      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.95, 1.08, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      )}

      <Html position={[0, buildingCount * 0.12 + 0.9, 0]} center distanceFactor={14} occlude={false}>
        <div className="region-label" data-selected={selected}>
          <div className="region-label-name">{region.name}</div>
          {!region.isHomeland && (
            <div className="region-label-meta">
              {Math.round(region.controlShare)}% control
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
