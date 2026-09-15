"use client";

import { useEffect, useRef } from "react";

const CHARS = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ€$%◆●■▲".split("");
const FONT_SIZE = 16;

/**
 * Fond animé façon "pluie de code", redessiné dans notre propre palette
 * (volt/ember sur fond noir) plutôt qu'un vert Matrix générique — effet
 * purement décoratif en <canvas> 2D, derrière l'avatar 3D (qui devient
 * transparent pour le laisser transparaître). Respecte
 * prefers-reduced-motion.
 */
export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let columns = 0;
    let drops: number[] = [];

    function resize() {
      const canvas2 = canvasRef.current;
      if (!canvas2) return;
      canvas2.width = window.innerWidth;
      canvas2.height = window.innerHeight;
      columns = Math.ceil(canvas2.width / FONT_SIZE);
      drops = new Array(columns).fill(0).map(() => Math.floor(Math.random() * -40));
    }
    resize();
    window.addEventListener("resize", resize);

    if (reduceMotion) {
      // Rendu statique unique, pas de boucle d'animation.
      ctx.fillStyle = "#0a0d12";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return () => window.removeEventListener("resize", resize);
    }

    let raf = 0;
    let lastTime = 0;
    const frameInterval = 1000 / 20; // 20 fps suffit pour cet effet, économise le CPU/GPU

    function draw(time: number) {
      raf = requestAnimationFrame(draw);
      if (time - lastTime < frameInterval) return;
      lastTime = time;
      if (!ctx || !canvas) return;

      ctx.fillStyle = "rgba(10, 13, 18, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)] ?? "0";
        const dropY = drops[i] ?? 0;
        const x = i * FONT_SIZE;
        const y = dropY * FONT_SIZE;

        // Tête plus claire, traînée dans notre vert "volt" de marque.
        const isHead = Math.random() > 0.93;
        ctx.fillStyle = isHead ? "#eaffb0" : "rgba(200, 255, 61, 0.55)";
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = Math.floor(Math.random() * -20);
        } else {
          drops[i] = dropY + 1;
        }
      }
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-40"
    />
  );
}
