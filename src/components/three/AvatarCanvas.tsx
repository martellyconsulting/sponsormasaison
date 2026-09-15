"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import type { ZoneDTO } from "@/types/zone";
import { BodyRig } from "./BodyRig";
import { ResponsiveCamera } from "./ResponsiveCamera";
import { AVATAR_GROUP_Y_OFFSET } from "@/lib/zones.config";

export function AvatarCanvas({
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
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.1, 2.6], fov: 44 }}
      className="touch-none"
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
    >
      {/* Fond transparent : laisse apparaître le fond animé (MatrixRain) posé derrière ce canvas. */}
      <ResponsiveCamera />

      {/*
        Éclairage entièrement local (pas de HDR chargé depuis un CDN externe
        comme le ferait <Environment>) : plus robuste, ne dépend d'aucune
        ressource réseau qui pourrait être bloquée (bloqueur de pub, réseau
        d'entreprise) et casser le rendu 3D pour un visiteur.
      */}
      <hemisphereLight args={["#7d8ea3", "#12161d", 1.3]} />
      <ambientLight intensity={0.9} />
      <directionalLight
        position={[2, 3, 2]}
        intensity={1.9}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-2, 1.5, 1.5]} intensity={0.7} />
      <pointLight position={[-2, 1, -1]} intensity={0.6} color="#c8ff3d" />
      <pointLight position={[1.5, -1, 1]} intensity={0.45} color="#ff4d2e" />

      <Suspense fallback={null}>
        <group position={[0, AVATAR_GROUP_Y_OFFSET, 0]}>
          <BodyRig
            zones={zones}
            onSelectZone={onSelectZone}
            selectedZoneKey={selectedZoneKey}
            calibrate={calibrate}
          />
        </group>
        <ContactShadows position={[0, -0.95, 0]} opacity={0.55} scale={3} blur={2.4} far={1.2} />
      </Suspense>

      <OrbitControls
        makeDefault
        autoRotate={!calibrate}
        autoRotateSpeed={1.4}
        enablePan={false}
        enableZoom
        minDistance={1.6}
        maxDistance={4}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 1.7}
        target={[0, -0.05, 0]}
      />
    </Canvas>
  );
}
