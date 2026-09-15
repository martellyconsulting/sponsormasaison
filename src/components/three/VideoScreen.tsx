"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const PLANE_HEIGHT = 0.58;
const PLANE_ASPECT = 4 / 5; // portrait, même proportion que la référence du client
const PLANE_WIDTH = PLANE_HEIGHT * PLANE_ASPECT;
const FRAME_MARGIN = 0.035;

/**
 * Écran vidéo posé comme un vrai objet du décor 3D (pas un panneau HTML
 * superposé) : positionné derrière l'avatar, il tourne avec toute la scène
 * quand la caméra orbite autour — exactement le même effet que la
 * référence du client. Le corps de l'athlète l'occulte naturellement vue
 * de face (profondeur réelle du moteur 3D) et le révèle vue de dos, sans
 * calcul de visibilité "à la main".
 */
export function VideoScreen() {
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
    <group position={[-0.6, 0.32, -0.78]} rotation={[0, Math.PI, 0]}>
      {/* Bordure/bezel dans notre couleur de marque, légèrement en retrait */}
      <mesh position={[0, 0, -0.004]}>
        <planeGeometry args={[PLANE_WIDTH + FRAME_MARGIN, PLANE_HEIGHT + FRAME_MARGIN]} />
        <meshBasicMaterial color="#c8ff3d" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[PLANE_WIDTH + FRAME_MARGIN * 0.5, PLANE_HEIGHT + FRAME_MARGIN * 0.5]} />
        <meshBasicMaterial color="#05070a" toneMapped={false} />
      </mesh>
      {/* Écran */}
      <mesh>
        <planeGeometry args={[PLANE_WIDTH, PLANE_HEIGHT]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}
