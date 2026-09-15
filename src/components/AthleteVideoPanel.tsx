"use client";

/**
 * Panneau vidéo "miroir" : visible uniquement quand l'avatar 3D tourne le
 * dos à la caméra (piloté par FacingTracker, dans le Canvas), pour donner
 * l'impression de voir "l'autre côté" de l'athlète — comme un miroir posé
 * face à lui. Vidéo muette, en boucle, aucune interaction requise.
 *
 * Taille/proportions calées sur la référence appréciée par le client (une
 * fenêtre nettement plus grande que la précédente version, quasi carrée/
 * portrait) — mais habillée dans notre propre langage visuel (bordure
 * volt, coins techniques), pas une reprise du cadre décoratif du site
 * de référence.
 */
export function AthleteVideoPanel({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden={!visible}
      className="pointer-events-none absolute left-3 top-1/2 z-20 w-[clamp(150px,30vw,340px)] -translate-y-1/2 transition-all duration-500 sm:left-6"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateY(-50%) scale(${visible ? 1 : 0.94})`,
      }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-arena-volt/50 bg-black shadow-[0_0_36px_rgba(200,255,61,0.22)]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          {/* WebM/VP9 d'abord (plus léger, largement supporté), MP4/H.264 en repli universel. */}
          <source src="/videos/athlete-mirror.webm" type="video/webm" />
          <source src="/videos/athlete-mirror.mp4" type="video/mp4" />
        </video>

        {/* Coins techniques discrets, dans notre propre style plutôt qu'un cadre copié. */}
        <span className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 border-arena-volt/70" />
        <span className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r-2 border-t-2 border-arena-volt/70" />
        <span className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 border-arena-volt/70" />
        <span className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-arena-volt/70" />
      </div>
      <p className="mt-2 text-center text-[10px] uppercase tracking-[0.2em] text-arena-steel">
        Miroir · vue de face
      </p>
    </div>
  );
}
