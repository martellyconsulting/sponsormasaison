"use client";

import { useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ZoneConfig } from "@/lib/zones.config";
import { AVATAR_GROUP_Y_OFFSET } from "@/lib/zones.config";
import type { ZoneDTO } from "@/types/zone";
import { formatCents } from "@/lib/format";
import { quaternionFromNormal } from "./orientation";
import { LogoPlane } from "./LogoPlane";

export function ZoneMarker({
  config,
  zone,
  onSelect,
  highlighted,
}: {
  config: ZoneConfig;
  zone: ZoneDTO;
  onSelect: () => void;
  highlighted: boolean;
}) {
  const quat = useMemo(() => quaternionFromNormal(config.anchor.normal), [config]);

  const placeholderVariant: "empty" | "pending" = zone.sponsor ? "pending" : "empty";
  const placeholderTitle = zone.sponsor
    ? zone.sponsor.sponsorName ?? "Nouveau sponsor"
    : `${config.shortLabel} libre`;

  const [ax, ay, az] = config.anchor.position;
  const [nx, ny, nz] = config.anchor.normal;
  // Le pin flotte légèrement au-dessus/devant le panneau logo, dans la
  // direction de sa normale, pour rester lisible sans le recouvrir.
  const pinCenter: [number, number, number] = [ax + nx * 0.12, ay + 0.03, az + nz * 0.12];

  // Avec 12 zones, en montrer 12 en permanence (y compris celles dans le dos
  // quand on regarde de face, ou inversement) créerait un fouillis illisible
  // dès qu'on n'est pas pile face à l'avatar. On ne garde le pin visible que
  // lorsque sa normale fait à peu près face à la caméra — recalculé à chaque
  // frame (léger : un produit scalaire par zone), sans dépendre d'une
  // occlusion basée sur le rendu (peu fiable en rendu logiciel/headless).
  const anchorPos = useMemo(() => new THREE.Vector3(ax, ay, az), [ax, ay, az]);
  const anchorNormal = useMemo(() => new THREE.Vector3(nx, ny, nz).normalize(), [nx, ny, nz]);
  const [facingCamera, setFacingCamera] = useState(true);
  const facingRef = useRef(true);

  useFrame(({ camera }) => {
    // Le groupe racine partagé (AvatarCanvas) ne fait qu'une translation en Y
    // par rapport au monde : on y ramène la position de la caméra pour rester
    // dans le même repère que anchorPos/anchorNormal.
    const camLocal = camera.position.clone();
    camLocal.y -= AVATAR_GROUP_Y_OFFSET;
    const toCamera = camLocal.sub(anchorPos).normalize();
    const facing = toCamera.dot(anchorNormal) > 0.05;
    if (facing !== facingRef.current) {
      facingRef.current = facing;
      setFacingCamera(facing);
    }
  });

  return (
    <group>
      <LogoPlane
        anchor={config.anchor}
        quaternion={quat}
        logoUrl={zone.sponsor?.logoUrl ?? null}
        placeholderTitle={placeholderTitle}
        placeholderVariant={placeholderVariant}
        onSelect={onSelect}
      />

      <Html position={pinCenter} center distanceFactor={2.2} zIndexRange={[10, 0]}>
        <button
          onClick={onSelect}
          style={{
            opacity: facingCamera ? 1 : 0,
            pointerEvents: facingCamera ? "auto" : "none",
          }}
          className={`select-none whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-display uppercase tracking-wide backdrop-blur-sm transition-opacity duration-200 hover:scale-105 ${
            highlighted
              ? "border-arena-volt bg-arena-volt/20 text-arena-volt"
              : zone.isClosed
                ? "border-arena-line/70 bg-arena-panel/80 text-arena-steel"
                : "border-arena-ember/60 bg-arena-panel/80 text-white"
          }`}
        >
          {config.shortLabel} · {formatCents(zone.currentPriceCents)}
        </button>
      </Html>
    </group>
  );
}
