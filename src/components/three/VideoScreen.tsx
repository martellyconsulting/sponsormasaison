"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BODY_DIMENSIONS } from "@/lib/zones.config";

// Grand miroir, quasi grandeur nature à côté de l'athlète (même hauteur que
// l'avatar), toujours visible — pas un effet caché/révélé selon l'angle.
const PLANE_HEIGHT = BODY_DIMENSIONS.totalHeight * 0.9;
const PLANE_ASPECT = 4 / 5; // portrait
const PLANE_WIDTH = PLANE_HEIGHT * PLANE_ASPECT;
const FRAME_MARGIN = 0.05;

/**
 * Écran vidéo posé comme un vrai objet du décor 3D (pas un panneau HTML
 * superposé), à côté de l'avatar, dans le même sens que lui (comme un
 * miroir qu'il regarderait en permanence) — visible en continu, tourne
 * avec toute la scène quand la caméra orbite autour.
 */
const TARGET = new THREE.Vector3(0, -0.05, 0);
const AVATAR_HALF_WIDTH = 0.42; // dégagement pour ne jamais chevaucher l'avatar
const GAP = 0.14;

export function VideoScreen() {
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Le miroir doit rester "aussi grand que possible, jusqu'à la taille de
  // l'avatar" sans jamais déborder du cadre ni le chevaucher — on recalcule
  // son échelle et sa position à chaque frame en fonction du champ de vision
  // réel de la caméra (qui change lui-même selon l'écran, voir
  // ResponsiveCamera), plutôt qu'une taille fixe qui déborderait sur mobile.
  useFrame(({ camera, size }) => {
    const group = groupRef.current;
    if (!group || !(camera instanceof THREE.PerspectiveCamera)) return;

    const distance = camera.position.distanceTo(TARGET);
    const aspect = size.width / size.height;
    const vertHalf = THREE.MathUtils.degToRad(camera.fov / 2);
    const visibleHalfWidth = distance * Math.tan(vertHalf) * aspect;

    const rightEdge = -(AVATAR_HALF_WIDTH + GAP);
    const maxScale = THREE.MathUtils.clamp(
      (rightEdge + visibleHalfWidth * 0.94) / PLANE_WIDTH,
      0.32,
      1,
    );

    group.scale.setScalar(maxScale);
    group.position.x = rightEdge - (PLANE_WIDTH * maxScale) / 2;
  });

  useEffect(() => {
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.crossOrigin = "anonymous";
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
    videoRef.current = video;

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
    <group ref={groupRef} position={[-1.15, -0.05, 0]}>
      {/* Bordure/bezel dans notre couleur de marque, légèrement en retrait */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[PLANE_WIDTH + FRAME_MARGIN, PLANE_HEIGHT + FRAME_MARGIN]} />
        <meshBasicMaterial color="#c8ff3d" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[PLANE_WIDTH + FRAME_MARGIN * 0.5, PLANE_HEIGHT + FRAME_MARGIN * 0.5]} />
        <meshBasicMaterial color="#05070a" toneMapped={false} />
      </mesh>
      {/* Écran, face à la caméra — même sens que l'avatar */}
      <mesh>
        <planeGeometry args={[PLANE_WIDTH, PLANE_HEIGHT]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}
