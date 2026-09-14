"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatCents } from "@/lib/format";

type SponsorshipStatus = {
  found: boolean;
  status?: string;
  zoneKey?: string | null;
  zoneLabel?: string | null;
  amountPaidCents?: number;
  sponsorName?: string | null;
  sponsorUrl?: string | null;
  logoUrl?: string | null;
};

const POLL_MS = 1500;
const MAX_TRIES = 24; // ~36s — le webhook Stripe arrive normalement en quelques secondes

export function UploadForm({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<SponsorshipStatus | null>(null);
  const [tries, setTries] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data?.found) return;
    if (tries >= MAX_TRIES) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/sponsorships/${sessionId}`, { cache: "no-store" });
        const json: SponsorshipStatus = await res.json();
        if (!cancelled) {
          setData(json);
          if (!json.found) setTries((t) => t + 1);
        }
      } catch {
        if (!cancelled) setTries((t) => t + 1);
      }
    }, tries === 0 ? 0 : POLL_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sessionId, tries, data?.found]);

  if (submitted) {
    return (
      <Card>
        <h1 className="font-display text-2xl mb-2">Merci pour ton soutien 🎉</h1>
        <p className="text-arena-steel text-sm mb-6">
          Ton logo est maintenant visible sur le corps de l&apos;athlète, en direct sur le site.
        </p>
        <Link href="/" className="inline-block rounded-xl bg-arena-volt px-5 py-3 font-display text-arena-bg">
          Voir le résultat
        </Link>
      </Card>
    );
  }

  if (!data?.found) {
    const timedOut = tries >= MAX_TRIES;
    return (
      <Card>
        <h1 className="font-display text-2xl mb-2">
          {timedOut ? "Toujours en attente de confirmation" : "Confirmation du paiement en cours…"}
        </h1>
        <p className="text-arena-steel text-sm mb-4">
          {timedOut
            ? "Stripe met parfois un peu plus de temps à confirmer. Ton paiement est bien pris en compte — réessaie dans un instant."
            : "Merci, ton paiement a été reçu par Stripe. On finalise la confirmation, cela prend quelques secondes."}
        </p>
        {timedOut ? (
          <button
            onClick={() => setTries(0)}
            className="rounded-xl border border-arena-line px-4 py-2 text-sm hover:border-arena-steel"
          >
            Réessayer
          </button>
        ) : (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-arena-line">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-arena-volt" />
          </div>
        )}
      </Card>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/upload/${sessionId}`, { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Erreur lors de l'envoi.");
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <p className="text-xs uppercase tracking-widest text-arena-volt mb-1">Paiement confirmé</p>
      <h1 className="font-display text-2xl mb-1">{data.zoneLabel ?? "Zone de sponsoring"}</h1>
      <p className="text-arena-steel text-sm mb-6">
        {typeof data.amountPaidCents === "number" && `Montant payé : ${formatCents(data.amountPaidCents)} · `}
        Complète les infos ci-dessous, ton logo sera affiché immédiatement.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-arena-steel mb-1.5">
            Nom de la marque *
          </label>
          <input
            name="sponsorName"
            required
            maxLength={80}
            defaultValue={data.sponsorName ?? ""}
            placeholder="Ex. Studio Fit"
            className="w-full rounded-lg border border-arena-line bg-black/30 px-3 py-2.5 outline-none focus:border-arena-volt"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-arena-steel mb-1.5">
            Lien (site web / Instagram) — optionnel
          </label>
          <input
            name="sponsorUrl"
            type="text"
            defaultValue={data.sponsorUrl ?? ""}
            placeholder="https://…"
            className="w-full rounded-lg border border-arena-line bg-black/30 px-3 py-2.5 outline-none focus:border-arena-volt"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-arena-steel mb-1.5">
            Logo (PNG, JPG, WebP ou SVG — 4 Mo max) {!data.logoUrl && "*"}
          </label>
          <input
            ref={fileInputRef}
            name="logo"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            required={!data.logoUrl}
            className="w-full text-sm text-arena-steel file:mr-3 file:rounded-lg file:border-0 file:bg-arena-line file:px-3 file:py-2 file:text-white"
          />
          {data.logoUrl && (
            <p className="mt-1.5 text-xs text-arena-steel">
              Un logo est déjà enregistré — laisse ce champ vide pour le conserver.
            </p>
          )}
        </div>

        {submitError && <p className="text-sm text-arena-ember">{submitError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-arena-ember py-3 font-display uppercase tracking-wide disabled:opacity-40"
        >
          {submitting ? "Envoi…" : "Publier mon logo"}
        </button>
      </form>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-arena-line bg-arena-panel p-6 sm:p-8">
      {children}
    </div>
  );
}
