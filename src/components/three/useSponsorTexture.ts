"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const attempt = current ? `${current} ${word}` : word;
    if (ctx.measureText(attempt).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = attempt;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

/** Génère le badge texte de secours (placeholder) affiché tant qu'aucun logo n'est disponible. */
function drawPlaceholderBadge(title: string, variant: "empty" | "pending"): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, size, size);

  const pad = 24;
  ctx.fillStyle = variant === "empty" ? "rgba(18,22,29,0.55)" : "rgba(200,255,61,0.12)";
  roundRect(ctx, pad, pad, size - pad * 2, size - pad * 2, 36);
  ctx.fill();

  ctx.lineWidth = 6;
  ctx.setLineDash(variant === "empty" ? [18, 14] : []);
  ctx.strokeStyle = variant === "empty" ? "rgba(142,160,184,0.7)" : "#c8ff3d";
  roundRect(ctx, pad, pad, size - pad * 2, size - pad * 2, 36);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = variant === "empty" ? "#8ea0b8" : "#f4ffe0";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "600 40px sans-serif";
  const lines = wrapLines(ctx, title.toUpperCase(), size - pad * 4);
  const lineHeight = 50;
  const startY = size / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => ctx.fillText(line, size / 2, startY + i * lineHeight));

  return canvas;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Fournit la texture à plaquer sur une zone : le vrai logo du sponsor s'il a
 * été uploadé, sinon un badge texte généré automatiquement (mode
 * placeholder), en se recalculant à chaque changement de logo/sponsor
 * (piloté par le polling de /api/zones).
 */
export function useSponsorTexture(params: {
  logoUrl: string | null;
  placeholderTitle: string;
  placeholderVariant: "empty" | "pending";
}): THREE.Texture | null {
  const { logoUrl, placeholderTitle, placeholderVariant } = params;
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const previous = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    let cancelled = false;

    function applyPlaceholder() {
      const canvas = drawPlaceholderBadge(placeholderTitle, placeholderVariant);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      if (!cancelled) {
        previous.current?.dispose();
        previous.current = tex;
        setTexture(tex);
      } else {
        tex.dispose();
      }
    }

    if (logoUrl) {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      loader.load(
        logoUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.needsUpdate = true;
          if (!cancelled) {
            previous.current?.dispose();
            previous.current = tex;
            setTexture(tex);
          } else {
            tex.dispose();
          }
        },
        undefined,
        applyPlaceholder,
      );
    } else {
      applyPlaceholder();
    }

    return () => {
      cancelled = true;
    };
  }, [logoUrl, placeholderTitle, placeholderVariant]);

  useEffect(() => {
    return () => {
      previous.current?.dispose();
    };
  }, []);

  return texture;
}
