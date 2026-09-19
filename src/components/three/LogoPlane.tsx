"use client";

import { useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { ZoneAnchor } from "@/lib/zones.config";
import { useSponsorTexture } from "./useSponsorTexture";

/** Un panneau logo plaqué sur le corps à un point d'ancrage (un côté d'une zone). */
export function LogoPlane({
  anchor,
  quaternion,
  logoUrl,
  placeholderTitle,
  placeholderVariant,
  onSelect,
}: {
  anchor: ZoneAnchor;
  quaternion: THREE.Quaternion;
  logoUrl: string | null;
  placeholderTitle: string;
  placeholderVariant: "empty" | "pending";
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const texture = useSponsorTexture({ logoUrl, placeholderTitle, placeholderVariant });

  // Léger décalage vers l'avant (le long de la normale) : posé exactement à
  // fleur de peau, le panneau se fait par endroits engloutir par le maillage
  // du corps (z-fighting) selon l'angle de vue, donnant l'impression qu'il
  // "flotte mal placé". Le sortir très légèrement de la surface le garde
  // net et bien visible sous tous les angles.
  const [nx, ny, nz] = anchor.normal;
  const normalLength = Math.hypot(nx, ny, nz) || 1;
  const lift = 0.006;
  const liftedPosition: [number, number, number] = [
    anchor.position[0] + (nx / normalLength) * lift,
    anchor.position[1] + (ny / normalLength) * lift,
    anchor.position[2] + (nz / normalLength) * lift,
  ];

  return (
    <group position={liftedPosition} quaternion={quaternion}>
      <mesh
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        scale={hovered ? 1.06 : 1}
      >
        <planeGeometry args={anchor.size} />
        {texture ? (
          <meshBasicMaterial map={texture} transparent toneMapped={false} />
        ) : (
          <meshBasicMaterial color="#12161d" transparent opacity={0.4} />
        )}
      </mesh>
    </group>
  );
}
