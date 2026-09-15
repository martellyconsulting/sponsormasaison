"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { BODY_DIMENSIONS as D } from "@/lib/zones.config";

const SKIN = "#4a5568";
const TRIM = "#5b6472";

/** Capsule reliant deux points (utilisé pour bras/jambes de l'avatar de secours). */
function Limb({
  from,
  to,
  radius,
  color = SKIN,
}: {
  from: [number, number, number];
  to: [number, number, number];
  radius: number;
  color?: string;
}) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    );
    return { position: mid, quaternion: quat, length: Math.max(len - radius, 0.02) };
  }, [from, to]);

  return (
    <mesh position={position} quaternion={quaternion} castShadow receiveShadow>
      <capsuleGeometry args={[radius, length, 4, 10]} />
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.08} />
    </mesh>
  );
}

/**
 * Silhouette basse-poly utilisée tant que le vrai scan `athlete.glb` (fourni
 * séparément) n'est pas présent dans `public/models/`. Ses proportions
 * suivent `BODY_DIMENSIONS` / `zones.config.ts` pour que les zones de
 * sponsoring restent correctement alignées.
 */
export function ProceduralBody() {
  return (
    <group>
      {/* Tête */}
      <mesh position={[0, D.headCenterY, 0]} castShadow>
        <sphereGeometry args={[D.headRadius, 24, 24]} />
        <meshStandardMaterial color={SKIN} roughness={0.5} />
      </mesh>

      {/* Cou */}
      <Limb from={[0, D.headCenterY - D.headRadius - 0.02, 0]} to={[0, D.shoulderY + 0.04, 0]} radius={0.06} />

      {/* Torse */}
      <Limb from={[0, D.hipY + 0.04, 0]} to={[0, D.shoulderY, 0]} radius={0.17} color={TRIM} />

      {/* Épaules */}
      <mesh position={[-D.shoulderX, D.shoulderY, 0]} castShadow>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>
      <mesh position={[D.shoulderX, D.shoulderY, 0]} castShadow>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>

      {/* Bras (biceps + avant-bras) */}
      <Limb from={[-D.shoulderX, D.shoulderY, 0]} to={[-0.31, D.elbowY, 0.02]} radius={0.075} />
      <Limb from={[D.shoulderX, D.shoulderY, 0]} to={[0.31, D.elbowY, 0.02]} radius={0.075} />
      <Limb from={[-0.31, D.elbowY, 0.02]} to={[-0.33, D.wristY, 0.05]} radius={0.06} />
      <Limb from={[0.31, D.elbowY, 0.02]} to={[0.33, D.wristY, 0.05]} radius={0.06} />

      {/* Bassin */}
      <mesh position={[0, D.hipY, 0]} castShadow>
        <boxGeometry args={[0.32, 0.14, 0.2]} />
        <meshStandardMaterial color={TRIM} roughness={0.6} />
      </mesh>

      {/* Jambes (cuisses + mollets) */}
      <Limb from={[-0.11, D.hipY - 0.05, 0]} to={[-0.13, D.kneeY, 0.02]} radius={0.1} />
      <Limb from={[0.11, D.hipY - 0.05, 0]} to={[0.13, D.kneeY, 0.02]} radius={0.1} />
      <Limb from={[-0.13, D.kneeY, 0.02]} to={[-0.12, D.ankleY, -0.01]} radius={0.075} />
      <Limb from={[0.13, D.kneeY, 0.02]} to={[0.12, D.ankleY, -0.01]} radius={0.075} />

      {/* Pieds */}
      <mesh position={[-0.12, D.feetY, 0.05]} castShadow>
        <boxGeometry args={[0.09, 0.06, 0.24]} />
        <meshStandardMaterial color="#0d1015" roughness={0.4} />
      </mesh>
      <mesh position={[0.12, D.feetY, 0.05]} castShadow>
        <boxGeometry args={[0.09, 0.06, 0.24]} />
        <meshStandardMaterial color="#0d1015" roughness={0.4} />
      </mesh>
    </group>
  );
}
