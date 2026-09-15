"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Le champ de vision vertical est fixe (fov), mais l'étendue horizontale
 * visible dépend de l'aspect ratio du canvas. Sur un écran étroit
 * (mobile, portrait), l'aspect est petit et les pins des bras (les plus
 * excentrés horizontalement) sortent du cadre. On recule la caméra dans
 * ce cas pour que tout reste visible, quitte à ce que l'avatar paraisse
 * un peu plus petit.
 */
export function ResponsiveCamera() {
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const aspect = width / height;
    const targetZ = aspect < 0.85 ? 3.6 : aspect < 1.15 ? 3.0 : 2.6;
    camera.position.z = targetZ;
    camera.updateProjectionMatrix();
  }, [camera, width, height]);

  return null;
}
