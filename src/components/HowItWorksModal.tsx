"use client";

export function HowItWorksModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-arena-line bg-arena-panel p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <h3 className="font-display text-xl">Comment ça marche ?</h3>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full border border-arena-line px-2.5 py-1 text-arena-steel hover:text-white"
          >
            ✕
          </button>
        </div>
        <p className="text-sm leading-relaxed text-arena-steel">
          Chaque zone du corps de l'athlète est une surface de sponsoring. Clique sur une zone de
          l'avatar pour voir son prix actuel et la sponsoriser en ligne. Ton logo s'affiche alors
          directement sur le corps, en direct, visible par tous les visiteurs du site. Si une
          autre marque surenchérit avant la deadline, le prix double automatiquement et tu es
          remboursé (montant payé moins les frais Stripe).
        </p>
      </div>
    </div>
  );
}
