import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Region } from '../types';
import { PLAYABLE_GEOMETRY } from '../data/worldGeo';
import { buildShapes } from '../utils/shapeUtils';
import { useGameStore } from '../state/gameStore';
import {
  Building,
  ControlTower,
  MissileSilo,
  RadarDish,
  WatchTower,
  OilDerrick,
  BankVault,
  BonyadDome,
  NavalUnit,
} from './models/Kit';

const RIVAL_COLOR = new THREE.Color('#8a3a3a');
const PLAYER_COLOR = new THREE.Color('#c9a227');
const HOMELAND_COLOR = new THREE.Color('#2f6b4f');
const PLATE_THICKNESS = 0.16;

// Regions with a coastline that get a naval token once proxy intensity is high.
const COASTAL_OFFSETS: Record<string, [number, number]> = {
  yemen: [0.3, 1.15],
  gulf: [1.15, 0.4],
};

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
  const geo = PLAYABLE_GEOMETRY[region.id];
  const groupRef = useRef<THREE.Group>(null);
  const sectors = useGameStore((s) => (region.isHomeland ? s.sectors : null));
  const color = useMemo(() => controlColor(region.controlShare, region.isHomeland), [region.controlShare, region.isHomeland]);

  const plateGeometry = useMemo(() => {
    const shapes = buildShapes(geo.polygons);
    return new THREE.ExtrudeGeometry(shapes, { depth: PLATE_THICKNESS, bevelEnabled: false });
  }, [geo]);

  const r = geo.buildingRadius;
  const buildingCount = region.isHomeland ? 3 : 2 + region.intensity;
  const buildings = useMemo(() => {
    const rand = mulberry32(hashCode(region.id));
    return Array.from({ length: buildingCount }, (_, i) => {
      const angle = (i / buildingCount) * Math.PI * 2 + rand() * 2;
      const radius = r * (0.35 + rand() * 0.5);
      const h = 0.22 + rand() * (0.35 + region.intensity * 0.18);
      return {
        pos: [Math.cos(angle) * radius, PLATE_THICKNESS, Math.sin(angle) * radius] as [number, number, number],
        h,
        w: Math.max(0.06, r * (0.1 + rand() * 0.05)),
      };
    });
  }, [buildingCount, region.id, region.intensity, r]);

  const homelandKit = useMemo(() => {
    const ring = (n: number, radiusFactor: number) =>
      Array.from({ length: n }, (_, i) => {
        const angle = (i / n) * Math.PI * 2 + 0.4;
        const radius = r * radiusFactor;
        return [Math.cos(angle) * radius, Math.sin(angle) * radius] as [number, number];
      });
    return { silos: ring(2, 0.35), dish: ring(1, 0.55)[0] };
  }, [r]);

  const navalOffset = COASTAL_OFFSETS[region.id];
  const showNaval = navalOffset && region.intensity >= 3;

  useFrame((_, delta) => {
    if (groupRef.current && selected) {
      groupRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <group position={[x, 0, z]}>
      <mesh
        geometry={plateGeometry}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <meshStandardMaterial color={color} emissive={selected ? '#ffffff' : '#000000'} emissiveIntensity={selected ? 0.15 : 0} />
      </mesh>

      <group ref={groupRef}>
        {region.isHomeland ? (
          <>
            <ControlTower position={[0, PLATE_THICKNESS, 0]} height={1.3} />
            {homelandKit.silos.map((p, i) => (
              <MissileSilo key={i} position={[p[0], PLATE_THICKNESS, p[1]]} />
            ))}
            <RadarDish position={[homelandKit.dish[0], PLATE_THICKNESS, homelandKit.dish[1]]} />
            {sectors?.find((s) => s.id === 'oil')?.assigned && (
              <OilDerrick position={[-r * 0.55, PLATE_THICKNESS, r * 0.15]} height={0.55} />
            )}
            {sectors?.find((s) => s.id === 'construction')?.assigned && (
              <Building position={[r * 0.15, PLATE_THICKNESS, -r * 0.55]} height={0.6} width={0.18} color="#b7bec9" />
            )}
            {sectors?.find((s) => s.id === 'banking')?.assigned && (
              <BankVault position={[r * 0.5, PLATE_THICKNESS, r * 0.4]} />
            )}
            {sectors?.find((s) => s.id === 'bonyads')?.assigned && (
              <BonyadDome position={[-r * 0.15, PLATE_THICKNESS, r * 0.55]} />
            )}
          </>
        ) : (
          <>
            {buildings.map((b, i) => (
              <Building key={i} position={b.pos} height={b.h} width={b.w} />
            ))}
            {region.intensity >= 3 && <WatchTower position={[0, PLATE_THICKNESS, r * 0.7]} height={0.5 + region.intensity * 0.08} />}
          </>
        )}
      </group>

      {showNaval && (
        <NavalUnit position={[navalOffset[0], -0.08, navalOffset[1]]} scale={0.9 + region.intensity * 0.05} />
      )}

      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PLATE_THICKNESS + 0.01, 0]}>
          <ringGeometry args={[r * 1.15, r * 1.3, 40]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      )}

      <Html position={[0, PLATE_THICKNESS + Math.max(0.7, r * 0.7), 0]} center distanceFactor={16} occlude={false}>
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
