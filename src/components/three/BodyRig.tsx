"use client";

import { Suspense, useEffect, useState } from "react";
import { Html } from "@react-three/drei";
import { ZONES } from "@/lib/zones.config";
import type { ZoneDTO } from "@/types/zone";
import { ProceduralBody } from "./ProceduralBody";
import { GltfBody } from "./GltfBody";
import { ModelErrorBoundary } from "./ModelErrorBoundary";
import { ZoneMarker } from "./ZoneMarker";
import { useGlbAvailability } from "./useGlbAvailability";

export function BodyRig({
  zones,
  onSelectZone,
  selectedZoneKey,
  calibrate,
}: {
  zones: ZoneDTO[];
  onSelectZone: (key: string) => void;
  selectedZoneKey: string | null;
  calibrate: boolean;
}) {
  const { checked, available, path } = useGlbAvailability();
  const [calibrationPoint, setCalibrationPoint] = useState<{ x: number; y: number; z: number } | null>(
    null,
  );

  useEffect(() => {
    if (!calibrate) return;
    const handler = (e: Event) => setCalibrationPoint((e as CustomEvent).detail);
    window.addEventListener("calibrate-point", handler);
    return () => window.removeEventListener("calibrate-point", handler);
  }, [calibrate]);

  const zoneByKey = new Map(zones.map((z) => [z.key, z]));

  return (
    <group>
      {checked && available ? (
        <ModelErrorBoundary fallback={<ProceduralBody />}>
          <Suspense fallback={<ProceduralBody />}>
            <GltfBody path={path} calibrate={calibrate} />
          </Suspense>
        </ModelErrorBoundary>
      ) : (
        <ProceduralBody />
      )}

      {ZONES.map((config) => {
        const zone = zoneByKey.get(config.key);
        if (!zone) return null;
        return (
          <ZoneMarker
            key={config.key}
            config={config}
            zone={zone}
            onSelect={() => onSelectZone(config.key)}
            highlighted={selectedZoneKey === config.key}
          />
        );
      })}

      {calibrate && calibrationPoint && (
        <Html position={[calibrationPoint.x, calibrationPoint.y, calibrationPoint.z]} center>
          <div className="pointer-events-none rounded bg-arena-volt px-2 py-1 text-[10px] font-mono text-arena-bg">
            [{calibrationPoint.x.toFixed(3)}, {calibrationPoint.y.toFixed(3)}, {calibrationPoint.z.toFixed(3)}]
          </div>
        </Html>
      )}
    </group>
  );
}
