"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { BODY_DIMENSIONS } from "@/lib/zones.config";

// Deux écrans-miroirs, grandeur quasi nature, fixés dans le décor 3D comme
// de vrais objets (pas attachés à la caméra) : un devant l'athlète, un
// derrière. Chacun n'est visible que depuis son propre côté — comme deux
// vrais écrans plantés dans la scène, pas un panneau qui suit le regard.
// Ils restent en second plan : l'avatar (premier plan) reste le sujet
// principal, l'effet Matrix (arrière-plan) reste derrière tout.
const PLANE_HEIGHT = BODY_DIMENSIONS.totalHeight * 0.9;
const PLANE_ASPECT = 4 / 5; // portrait
const PLANE_WIDTH = PLANE_HEIGHT * PLANE_ASPECT;
const FRAME_MARGIN = 0.05;

const TARGET = new THREE.Vector3(0, -0.05, 0);
const AVATAR_HALF_WIDTH = 0.42; // dégagement pour ne jamais chevaucher l'avatar
const GAP = 0.34;
const DEPTH = 0.62; // recul par rapport à l'avatar, pour rester "en second plan"

type Side = "front" | "back";

function MirrorPanel({
  side,
  texture,
  onExpand,
}: {
  side: Side;
  texture: THREE.VideoTexture;
  onExpand: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const sign = side === "front" ? -1 : 1;

  // Taille/position recalculées à chaque frame selon le champ de vision réel
  // de la caméra (voir ResponsiveCamera) pour ne jamais déborder du cadre ni
  // chevaucher l'avatar, y compris sur mobile.
  useFrame(({ camera, size }) => {
    const group = groupRef.current;
    if (!group || !(camera instanceof THREE.PerspectiveCamera)) return;

    const distance = camera.position.distanceTo(TARGET);
    const aspect = size.width / size.height;
    const vertHalf = THREE.MathUtils.degToRad(camera.fov / 2);
    const visibleHalfWidth = distance * Math.tan(vertHalf) * aspect;

    const edge = AVATAR_HALF_WIDTH + GAP;
    const maxScale = THREE.MathUtils.clamp(
      (visibleHalfWidth * 0.94 - edge) / PLANE_WIDTH,
      0.3,
      1,
    );
    group.scale.setScalar(maxScale);
    group.position.x = sign * (edge + (PLANE_WIDTH * maxScale) / 2);
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onExpand();
  };

  return (
    <group
      ref={groupRef}
      position={[sign * 1.1, -0.05, sign * DEPTH]}
      rotation={[0, side === "back" ? Math.PI : 0, 0]}
    >
      {/* Bordure/bezel dans notre couleur de marque, légèrement en retrait */}
      <mesh position={[0, 0, -0.01]} onClick={handleClick}>
        <planeGeometry args={[PLANE_WIDTH + FRAME_MARGIN, PLANE_HEIGHT + FRAME_MARGIN]} />
        <meshBasicMaterial color="#c8ff3d" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[PLANE_WIDTH + FRAME_MARGIN * 0.5, PLANE_HEIGHT + FRAME_MARGIN * 0.5]} />
        <meshBasicMaterial color="#05070a" toneMapped={false} />
      </mesh>
      {/* Écran, même sens que l'avatar de ce côté */}
      <mesh onClick={handleClick}>
        <planeGeometry args={[PLANE_WIDTH, PLANE_HEIGHT]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function VideoScreen({ onExpand }: { onExpand: () => void }) {
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);

  useEffect(() => {
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.style.position = "fixed";
    video.style.width = "1px";
    video.style.height = "1px";
    video.style.opacity = "0";
    video.style.pointerEvents = "none";

    const webmSource = document.createElement("source");
    webmSource.src = "/videos/athlete-mirror.webm";
    webmSource.type = "video/webm";
    const mp4Source = document.createElement("source");
    mp4Source.src = "/videos/athlete-mirror.mp4";
    mp4Source.type = "video/mp4";
    video.appendChild(webmSource);
    video.appendChild(mp4Source);

    document.body.appendChild(video);

    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;

    function fitCrop() {
      // "object-fit: cover" manuel : recadre la texture pour remplir le
      // plan portrait sans déformer l'image, quelles que soient les
      // proportions réelles de la vidéo source.
      const videoAspect = video.videoWidth / video.videoHeight || PLANE_ASPECT;
      if (videoAspect > PLANE_ASPECT) {
        const repeatX = PLANE_ASPECT / videoAspect;
        tex.repeat.set(repeatX, 1);
        tex.offset.set((1 - repeatX) / 2, 0);
      } else {
        const repeatY = videoAspect / PLANE_ASPECT;
        tex.repeat.set(1, repeatY);
        tex.offset.set(0, (1 - repeatY) / 2);
      }
    }
    video.addEventListener("loadedmetadata", fitCrop);
    video.play().catch(() => {});

    setTexture(tex);

    return () => {
      video.removeEventListener("loadedmetadata", fitCrop);
      video.pause();
      video.remove();
      tex.dispose();
    };
  }, []);

  if (!texture) return null;

  return (
    <>
      <MirrorPanel side="front" texture={texture} onExpand={onExpand} />
      <MirrorPanel side="back" texture={texture} onExpand={onExpand} />
    </>
  );
}
