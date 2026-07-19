import { useMemo } from 'react';
import * as THREE from 'three';
import { CONTEXT_GEOMETRY, MAP_BOUNDS } from '../data/worldGeo';
import { buildShapes } from '../utils/shapeUtils';

const CONTEXT_THICKNESS = 0.05;

function ContextCountry({ polygons }: { polygons: [number, number][][][] }) {
  const geometry = useMemo(() => {
    const shapes = buildShapes(polygons);
    return new THREE.ExtrudeGeometry(shapes, { depth: CONTEXT_THICKNESS, bevelEnabled: false });
  }, [polygons]);

  return (
    <mesh geometry={geometry} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial color="#4a5142" roughness={1} />
    </mesh>
  );
}

export default function WorldMap() {
  const oceanWidth = Math.max(MAP_BOUNDS.maxX - MAP_BOUNDS.minX, MAP_BOUNDS.maxZ - MAP_BOUNDS.minZ) + 20;
  const oceanCenterX = (MAP_BOUNDS.minX + MAP_BOUNDS.maxX) / 2;
  const oceanCenterZ = (MAP_BOUNDS.minZ + MAP_BOUNDS.maxZ) / 2;

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[oceanCenterX, -0.06, oceanCenterZ]}
        receiveShadow
      >
        <planeGeometry args={[oceanWidth, oceanWidth]} />
        <meshStandardMaterial color="#1f5270" roughness={0.75} />
      </mesh>
      {CONTEXT_GEOMETRY.map((c) => (
        <ContextCountry key={c.name} polygons={c.polygons} />
      ))}
    </group>
  );
}
