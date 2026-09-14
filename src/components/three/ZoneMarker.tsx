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
  const leftQuat = useMemo(() => quaternionFromNormal(config.anchors.left.normal), [config]);
  const rightQuat = useMemo(() => quaternionFromNormal(config.anchors.right.normal), [config]);

  const placeholderVariant: "empty" | "pending" = zone.sponsor ? "pending" : "empty";
  const placeholderTitle = zone.sponsor
    ? zone.sponsor.sponsorName ?? "Nouveau sponsor"
    : `${config.shortLabel} libre`;

  const pinCenter: [number, number, number] = [
    (config.anchors.left.position[0] + config.anchors.right.position[0]) / 2,
    (config.anchors.left.position[1] + config.anchors.right.position[1]) / 2 + 0.02,
    Math.max(config.anchors.left.position[2], config.anchors.right.position[2]) + 0.16,
  ];

  return (
    <group>
      <LogoPlane
        anchor={config.anchors.left}
        quaternion={leftQuat}
        logoUrl={zone.sponsor?.logoUrl ?? null}
        placeholderTitle={placeholderTitle}
        placeholderVariant={placeholderVariant}
        onSelect={onSelect}
      />
      <LogoPlane
        anchor={config.anchors.right}
        quaternion={rightQuat}
        logoUrl={zone.sponsor?.logoUrl ?? null}
        placeholderTitle={placeholderTitle}
        placeholderVariant={placeholderVariant}
        onSelect={onSelect}
      />

      <Html position={pinCenter} center distanceFactor={2.6} zIndexRange={[10, 0]}>
        <button
          onClick={onSelect}
          className={`pointer-events-auto select-none whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-display uppercase tracking-wide backdrop-blur-sm transition-transform hover:scale-105 ${
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
