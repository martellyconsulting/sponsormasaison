"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { BODY_DIMENSIONS } from "@/lib/zones.config";

// Grand miroir, quasi grandeur nature à côté de l'athlète, toujours visible
// (billboard face caméra). Pour donner du dynamisme, il alterne côté
// gauche/droit toutes les SWITCH_SECONDS, avec un glissement fluide plutôt
// qu'un saut brusque.
const PLANE_HEIGHT = BODY_DIMENSIONS.totalHeight * 0.9;
const PLANE_ASPECT = 4 / 5; // portrait
const PLANE_WIDTH = PLANE_HEIGHT * PLANE_ASPECT;
const FRAME_MARGIN = 0.05;

const TARGET = new THREE.Vector3(0, -0.05, 0);
const AVATAR_HALF_WIDTH = 0.42; // dégagement pour ne jamais chevaucher l'avatar
const GAP = 0.48; // marge nette pour ne pas coller à l'épaule
const SWITCH_SECONDS = 10;
const SLIDE_SPEED = 1.4; // vitesse d'interpolation du glissement gauche/droite

// Vecteurs de travail réutilisés à chaque frame (évite une allocation à 60fps).
const camRight = new THREE.Vector3();
const nextPosition = new THREE.Vector3();

export function VideoScreen({ onExpand }: { onExpand: () => void }) {
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const sideRef = useRef(-1); // -1 = gauche, +1 = droite, valeurs intermédiaires pendant le glissement

  useFrame(({ camera, size, clock }, delta) => {
    const group = groupRef.current;
    if (!group || !(camera instanceof THREE.PerspectiveCamera)) return;

    group.quaternion.copy(camera.quaternion);

    const targetSide = Math.floor(clock.elapsedTime / SWITCH_SECONDS) % 2 === 0 ? -1 : 1;
    sideRef.current = THREE.MathUtils.damp(sideRef.current, targetSide, SLIDE_SPEED, delta);

    const distance = camera.position.distanceTo(TARGET);
    const aspect = size.width / size.height;
    const vertHalf = THREE.MathUtils.degToRad(camera.fov / 2);
    const visibleHalfWidth = distance * Math.tan(vertHalf) * aspect;

    const edge = AVATAR_HALF_WIDTH + GAP;
    const maxScale = THREE.MathUtils.clamp(
      (visibleHalfWidth * 0.94 - edge) / PLANE_WIDTH,
      0.32,
      1,
    );
    group.scale.setScalar(maxScale);

    const xOffset = sideRef.current * (edge + (PLANE_WIDTH * maxScale) / 2);
    camRight.setFromMatrixColumn(camera.matrixWorld, 0);
    nextPosition.copy(TARGET).addScaledVector(camRight, xOffset);
    group.position.copy(nextPosition);
  });

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

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onExpand();
  };

  return (
    <group ref={groupRef} position={[-1.15, -0.05, 0]}>
      {/* Bordure/bezel dans notre couleur de marque, légèrement en retrait */}
      <mesh position={[0, 0, -0.01]} onClick={handleClick}>
        <planeGeometry args={[PLANE_WIDTH + FRAME_MARGIN, PLANE_HEIGHT + FRAME_MARGIN]} />
        <meshBasicMaterial color="#c8ff3d" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[PLANE_WIDTH + FRAME_MARGIN * 0.5, PLANE_HEIGHT + FRAME_MARGIN * 0.5]} />
        <meshBasicMaterial color="#05070a" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Écran, toujours face caméra */}
      <mesh onClick={handleClick}>
        <planeGeometry args={[PLANE_WIDTH, PLANE_HEIGHT]} />
        <meshBasicMaterial map={texture} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
