"use client";

export function SoundToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Couper la musique" : "Activer la musique"}
      title={enabled ? "Couper la musique" : "Activer la musique"}
      className={`pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border backdrop-blur-sm transition ${
        enabled
          ? "border-arena-volt bg-arena-volt/15 text-arena-volt"
          : "border-arena-line bg-arena-panel/80 text-arena-steel hover:text-white"
      }`}
    >
      {enabled ? (
        // Icône haut-parleur "son actif"
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="currentColor" />
          <path
            d="M16.5 8.5a5 5 0 0 1 0 7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M19 6a9 9 0 0 1 0 12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      ) : (
        // Icône haut-parleur "coupé"
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="currentColor" />
          <path
            d="m16 9 5 6M21 9l-5 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
