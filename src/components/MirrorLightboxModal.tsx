"use client";

export function MirrorLightboxModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-arena-volt/50 bg-arena-panel shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-lg text-white backdrop-blur-sm transition hover:bg-arena-volt hover:text-black"
        >
          ✕
        </button>
        <video
          className="aspect-[4/5] w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/videos/athlete-mirror.webm" type="video/webm" />
          <source src="/videos/athlete-mirror.mp4" type="video/mp4" />
        </video>
        <p className="px-5 py-4 text-sm leading-relaxed text-arena-steel">
          Ceci est le vrai corps de l'athlète — c'est ici, sur sa peau, que ton logo sera
          affiché pendant toute la saison.
        </p>
      </div>
    </div>
  );
}
