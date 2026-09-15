"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AVATAR_GROUP_Y_OFFSET } from "@/lib/zones.config";

// Direction "face avant" de référence de l'avatar, dans le même repère que
// les ancres de zones (voir zones.config.ts) : les zones de face (biceps,
// cuisses, etc.) ont toutes une normale à composante Z positive.
const FRONT_NORMAL = new THREE.Vector3(0, 0, 1);
const PIVOT = new THREE.Vector3(0, 0.3, 0);

/**
 * Ne rend rien à l'écran : calcule à chaque frame si la caméra regarde le
 * dos de l'avatar (plutôt que sa face), et prévient le parent (composant
 * React hors du Canvas) via un callback, pour piloter un panneau vidéo en
 * miroir — visible seulement quand on voit le dos, comme demandé.
 * Hystérésis entre les deux seuils pour éviter un clignotement au passage
 * du profil (~90°).
 */
export function FacingTracker({ onBackFacingChange }: { onBackFacingChange: (back: boolean) => void }) {
  const backRef = useRef(false);

  useFrame(({ camera }) => {
    const camLocal = camera.position.clone();
    camLocal.y -= AVATAR_GROUP_Y_OFFSET;
    const toCamera = camLocal.sub(PIVOT).normalize();
    const dot = toCamera.dot(FRONT_NORMAL);

    const wasBack = backRef.current;
    // Hystérésis : il faut dépasser -0.35 pour "entrer" dans la vue de dos,
    // et remonter au-dessus de -0.15 pour en "sortir" — évite un aller-retour
    // rapide pile à la limite.
    const isBack = wasBack ? dot <= -0.15 : dot < -0.35;

    if (isBack !== wasBack) {
      backRef.current = isBack;
      onBackFacingChange(isBack);
    }
  });

  return null;
}
