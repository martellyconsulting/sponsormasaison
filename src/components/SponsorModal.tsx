"use client";

import { useState } from "react";
import type { ZoneDTO } from "@/types/zone";
import type { ZoneConfig } from "@/lib/zones.config";
import { formatCents } from "@/lib/format";
import { Countdown } from "./Countdown";

export function SponsorModal({
  zone,
  config,
  serverTimeOffsetMs,
  onClose,
}: {
  zone: ZoneDTO;
  config: ZoneConfig;
  serverTimeOffsetMs: number;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneKey: zone.key }),
      });
      const data = await res.json();
      if (!res.ok || !("url" in data)) {
        throw new Error(data?.error ?? "Impossible de démarrer le paiement.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-arena-line bg-arena-panel p-5 sm:p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-arena-steel">Zone de sponsoring</p>
            <h3 className="font-display text-2xl">{config.label}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full border border-arena-line px-2.5 py-1 text-arena-steel hover:text-white"
          >
            ✕
          </button>
        </div>

        {zone.sponsor && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-arena-line bg-black/20 p-3">
            {zone.sponsor.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={zone.sponsor.logoUrl}
                alt={zone.sponsor.sponsorName ?? "Sponsor actuel"}
                className="h-10 w-10 rounded object-contain bg-white/5"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-arena-volt/10 border border-dashed border-arena-volt/40" />
            )}
            <div className="min-w-0">
              <p className="text-xs text-arena-steel">Sponsor actuel</p>
              <p className="truncate text-sm font-medium">{zone.sponsor.sponsorName ?? "Logo en cours d'ajout…"}</p>
            </div>
          </div>
        )}

        <div className="mt-5">
          <p className="text-xs uppercase tracking-widest text-arena-steel mb-2">Enchères closes dans</p>
          <Countdown deadline={zone.deadline} serverTimeOffsetMs={serverTimeOffsetMs} />
        </div>

        <div className="mt-5 flex items-end justify-between rounded-xl border border-arena-line bg-black/30 p-4">
          <div>
            <p className="text-xs text-arena-steel">Prix pour surenchérir maintenant</p>
            <p className="font-display text-3xl text-arena-volt">{formatCents(zone.currentPriceCents)}</p>
          </div>
          <p className="text-[11px] text-arena-steel text-right max-w-[9rem]">
            Double à la prochaine vente. Le sponsor actuel est remboursé automatiquement (frais Stripe déduits).
          </p>
        </div>

        {error && <p className="mt-3 text-sm text-arena-ember">{error}</p>}

        <button
          onClick={handleCheckout}
          disabled={loading || zone.isClosed}
          className="mt-5 w-full rounded-xl bg-arena-ember py-3 font-display text-lg uppercase tracking-wide text-white transition disabled:opacity-40 hover:brightness-110"
        >
          {zone.isClosed
            ? "Enchères closes"
            : loading
              ? "Redirection vers le paiement…"
              : `Sponsoriser — ${formatCents(zone.currentPriceCents)}`}
        </button>
        <p className="mt-3 text-center text-[11px] text-arena-steel">
          Paiement sécurisé par Stripe. Tu pourras uploader ton logo juste après.
        </p>
      </div>
    </div>
  );
}
