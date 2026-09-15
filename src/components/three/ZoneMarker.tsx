"use client";

import { useMemo } from "react";
import { Html } from "@react-three/drei";
import type { ZoneConfig } from "@/lib/zones.config";
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
          className={`pointer-events-auto select-none whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-display uppercase tracking-wide backdrop-blur-sm transition-transform hover:scale-105 ${
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
