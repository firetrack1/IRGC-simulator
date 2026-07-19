import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { StrikeVisualEvent } from '../types';

interface Props {
  event: StrikeVisualEvent;
  onComplete: () => void;
}

const DURATION = 1.4;

export default function StrikeEffect({ event, onComplete }: Props) {
  const elapsed = useRef(0);
  const [impact, setImpact] = useState(false);
  const projectileRef = useRef<THREE.Mesh>(null);
  const impactRef = useRef<THREE.Mesh>(null);
  const doneRef = useRef(false);

  const curve = useMemo(() => {
    const from = new THREE.Vector3(event.from[0], 0.3, event.from[1]);
    const to = new THREE.Vector3(event.to[0], 0.3, event.to[1]);
    const mid = from.clone().add(to).multiplyScalar(0.5);
    mid.y += event.weapon === 'missile' ? 6 : 3;
    return new THREE.QuadraticBezierCurve3(from, mid, to);
  }, [event]);

  useFrame((_, delta) => {
    if (doneRef.current) return;
    elapsed.current += delta;
    const t = Math.min(elapsed.current / DURATION, 1);

    if (t < 1) {
      const point = curve.getPoint(t);
      if (projectileRef.current) {
        projectileRef.current.position.copy(point);
        const tangent = curve.getTangent(t);
        projectileRef.current.lookAt(point.clone().add(tangent));
      }
    } else if (!impact) {
      setImpact(true);
    }

    if (impact && impactRef.current) {
      const impactT = Math.min((elapsed.current - DURATION) / 0.5, 1);
      const scale = 0.2 + impactT * 1.8;
      impactRef.current.scale.setScalar(scale);
      const mat = impactRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 1 - impactT;
      if (impactT >= 1 && !doneRef.current) {
        doneRef.current = true;
        onComplete();
      }
    }
  });

  return (
    <>
      {!impact && (
        <mesh ref={projectileRef}>
          {event.weapon === 'missile' ? (
            <coneGeometry args={[0.08, 0.35, 8]} />
          ) : (
            <boxGeometry args={[0.14, 0.03, 0.14]} />
          )}
          <meshStandardMaterial color={event.weapon === 'missile' ? '#ff6b3d' : '#7fd0ff'} emissive={event.weapon === 'missile' ? '#ff6b3d' : '#7fd0ff'} emissiveIntensity={1.2} />
        </mesh>
      )}
      {impact && (
        <mesh ref={impactRef} position={[event.to[0], 0.1, event.to[1]]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.6, 24]} />
          <meshBasicMaterial color="#ff8844" transparent opacity={1} side={THREE.DoubleSide} />
        </mesh>
      )}
    </>
  );
}
