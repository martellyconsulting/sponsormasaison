"use client";

/**
 * Panneau vidéo "miroir" : visible uniquement quand l'avatar 3D tourne le
 * dos à la caméra (piloté par FacingTracker, dans le Canvas), pour donner
 * l'impression de voir "l'autre côté" de l'athlète — comme un miroir posé
 * face à lui. Vidéo muette, en boucle, aucune interaction requise.
 */
export function AthleteVideoPanel({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden={!visible}
      className="pointer-events-none absolute left-3 top-1/2 z-20 w-[38vw] max-w-[220px] -translate-y-1/2 transition-all duration-500 sm:left-5"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateY(-50%) scale(${visible ? 1 : 0.94})`,
      }}
    >
      <div className="overflow-hidden rounded-xl border border-arena-volt/40 bg-black shadow-[0_0_24px_rgba(200,255,61,0.18)]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="block aspect-[16/9] w-full object-cover"
        >
          {/* WebM/VP9 d'abord (plus léger, largement supporté), MP4/H.264 en repli universel. */}
          <source src="/videos/athlete-mirror.webm" type="video/webm" />
          <source src="/videos/athlete-mirror.mp4" type="video/mp4" />
        </video>
      </div>
      <p className="mt-1.5 text-center text-[9px] uppercase tracking-[0.2em] text-arena-steel">
        Miroir · vue de face
      </p>
    </div>
  );
}
