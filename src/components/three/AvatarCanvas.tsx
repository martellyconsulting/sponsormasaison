"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import type { ZoneDTO } from "@/types/zone";
import { BodyRig } from "./BodyRig";

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
      camera={{ position: [0, 0.1, 2.6], fov: 32 }}
      className="touch-none"
      gl={{ antialias: true, preserveDrawingBuffer: false }}
    >
      <color attach="background" args={["#0a0d12"]} />
      <fog attach="fog" args={["#0a0d12", 4, 9]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[2, 3, 2]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-2, 1, -1]} intensity={0.5} color="#c8ff3d" />
      <pointLight position={[1.5, -1, 1]} intensity={0.35} color="#ff4d2e" />

      <Suspense fallback={null}>
        <group position={[0, -0.05, 0]}>
          <BodyRig
            zones={zones}
            onSelectZone={onSelectZone}
            selectedZoneKey={selectedZoneKey}
            calibrate={calibrate}
          />
        </group>
        <ContactShadows position={[0, -0.95, 0]} opacity={0.55} scale={3} blur={2.4} far={1.2} />
        <Environment preset="city" />
      </Suspense>

      <OrbitControls
        makeDefault
        autoRotate
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
