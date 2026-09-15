"use client";

import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { AVATAR_GROUP_Y_OFFSET, BODY_DIMENSIONS } from "@/lib/zones.config";

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
    // Les ancres de zones (zones.config.ts) sont exprimées dans le repère du
    // <group> racine partagé d'AvatarCanvas (décalé de AVATAR_GROUP_Y_OFFSET
    // par rapport au monde), PAS dans le repère interne de ce composant (qui
    // a son propre décalage supplémentaire pour poser les pieds au sol). On
    // convertit donc directement depuis les coordonnées monde du clic,
    // plutôt que via le group local de ce composant.
    const point = event.point as THREE.Vector3;
    const local = {
      x: point.x,
      y: point.y - AVATAR_GROUP_Y_OFFSET,
      z: point.z,
    };
    // eslint-disable-next-line no-console
    console.log(
      `[calibrate] position: [${local.x.toFixed(3)}, ${local.y.toFixed(3)}, ${local.z.toFixed(3)}]`,
    );
    window.dispatchEvent(new CustomEvent("calibrate-point", { detail: local }));
  };

  return (
    <group ref={group} onClick={handleClick}>
      <primitive object={prepared} />
    </group>
  );
}
