"use client";

import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { BODY_DIMENSIONS } from "@/lib/zones.config";

/**
 * Charge le vrai scan corporel (`public/models/athlete.glb`), le recentre à
 * l'origine et le met à l'échelle sur la hauteur de référence utilisée par
 * `zones.config.ts`, pour que les ancres de logos restent valables sans
 * avoir à connaître à l'avance les proportions exactes du scan.
 */
export function GltfBody({ path, calibrate }: { path: string; calibrate: boolean }) {
  const { scene } = useGLTF(path);
  const group = useRef<THREE.Group>(null);

  const prepared = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const height = size.y || 1;
    const scale = BODY_DIMENSIONS.totalHeight / height;

    clone.position.set(-center.x, -box.min.y, -center.z);
    clone.scale.setScalar(scale);

    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    return clone;
  }, [scene]);

  useEffect(() => {
    if (group.current) {
      // Repositionne les pieds sur BODY_DIMENSIONS.feetY après mise à l'échelle.
      group.current.position.y = BODY_DIMENSIONS.feetY;
    }
  }, []);

  const handleClick = (event: any) => {
    if (!calibrate) return;
    event.stopPropagation();
    const local = group.current
      ? group.current.worldToLocal(event.point.clone())
      : event.point;
    // eslint-disable-next-line no-console
    console.log(
      `[calibrate] position: [${local.x.toFixed(3)}, ${local.y.toFixed(3)}, ${local.z.toFixed(3)}]`,
    );
    window.dispatchEvent(
      new CustomEvent("calibrate-point", {
        detail: { x: local.x, y: local.y, z: local.z },
      }),
    );
  };

  return (
    <group ref={group} onClick={handleClick}>
      <primitive object={prepared} />
    </group>
  );
}
