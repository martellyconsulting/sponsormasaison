"use client";

import { useEffect, useMemo, useState } from "react";
import { AvatarCanvas } from "@/components/three/AvatarCanvas";
import { MatrixRain } from "@/components/MatrixRain";
import { SponsorModal } from "@/components/SponsorModal";
import { SponsorsOverviewModal } from "@/components/SponsorsOverviewModal";
import { HowItWorksModal } from "@/components/HowItWorksModal";
import { MirrorLightboxModal } from "@/components/MirrorLightboxModal";
import { NextRaceHUD } from "@/components/NextRaceHUD";
import { SoundToggle } from "@/components/SoundToggle";
import { useZones } from "@/hooks/useZones";
import { useMotivationalBeat } from "@/hooks/useMotivationalBeat";
import { getZoneConfig } from "@/lib/zones.config";

export default function HomePage() {
  const { zones, serverTimeOffsetMs, loading, error } = useZones();
  const [selectedZoneKey, setSelectedZoneKey] = useState<string | null>(null);
  const [calibrate, setCalibrate] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showOverview, setShowOverview] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showMirror, setShowMirror] = useState(false);
  const { enabled: soundOn, toggle: toggleSound } = useMotivationalBeat();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("calibrate") === "1") setCalibrate(true);
    if (params.get("paid") === "1") {
      setNotice("Paiement confirmé — merci ! Complète le formulaire pour afficher ton logo.");
    }
    const canceled = params.get("canceled");
    if (canceled) setNotice(`Paiement annulé pour la zone "${canceled}".`);
  }, []);

  const selectedZone = useMemo(
    () => zones.find((z) => z.key === selectedZoneKey) ?? null,
    [zones, selectedZoneKey],
  );
  const selectedConfig = selectedZoneKey ? getZoneConfig(selectedZoneKey) : undefined;
  const sponsoredCount = zones.filter((z) => z.sponsor).length;

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-arena-bg">
      {/* Fond animé, derrière l'avatar 3D (canvas transparent) */}
      <MatrixRain />

      {/* Avatar 3D en fond, plein écran */}
      <div className="absolute inset-0">
        <AvatarCanvas
          zones={zones}
          onSelectZone={setSelectedZoneKey}
          selectedZoneKey={selectedZoneKey}
          calibrate={calibrate}
          onExpandMirror={() => setShowMirror(true)}
        />
      </div>

      {loading && zones.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-arena-steel">
          Chargement de l'avatar…
        </div>
      )}

      {/* HUD minimal, superposé au canvas */}
      <div className="pointer-events-none relative z-10 flex h-full w-full flex-col justify-between p-4 sm:p-6">
        <header className="flex items-start justify-between gap-4">
          <div className="pointer-events-auto max-w-[60%]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-arena-volt sm:text-[11px]">
              Saison en cours
            </p>
            <h1 className="font-display text-xl leading-tight sm:text-3xl">
              SPONSORISE <span className="text-arena-ember">MA SAISON</span>
            </h1>
            <button
              onClick={() => setShowHowItWorks(true)}
              className="mt-1 text-xs text-arena-steel underline decoration-dotted underline-offset-4 hover:text-white"
            >
              Comment ça marche ?
            </button>
          </div>

          <div className="flex items-start gap-3">
            <SoundToggle enabled={soundOn} onToggle={toggleSound} />
            <NextRaceHUD />
          </div>
        </header>

        {notice && (
          <div className="pointer-events-auto mx-auto -mt-2 flex max-w-md items-center justify-between gap-3 rounded-lg border border-arena-volt/40 bg-arena-volt/10 px-4 py-2 text-sm backdrop-blur-sm">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} className="text-arena-steel hover:text-white">
              ✕
            </button>
          </div>
        )}

        <footer className="flex items-end justify-between gap-4">
          <p className="pointer-events-auto max-w-[45%] text-[10px] leading-relaxed text-arena-steel/70 sm:text-[11px]">
            Paiement sécurisé par Stripe. Site en mode démonstration tant que les clés de
            production ne sont pas configurées.
            {error && <span className="block text-arena-ember/80">Connexion au serveur perdue, nouvelle tentative…</span>}
          </p>

          <button
            onClick={() => setShowOverview(true)}
            className="pointer-events-auto shrink-0 rounded-full border border-arena-line bg-arena-panel/80 px-5 py-2.5 font-display text-sm uppercase tracking-wide backdrop-blur-sm transition hover:border-arena-volt hover:text-arena-volt"
          >
            Voir les sponsors · {sponsoredCount}/{zones.length || 14}
          </button>
        </footer>
      </div>

      {selectedZone && selectedConfig && (
        <SponsorModal
          zone={selectedZone}
          config={selectedConfig}
          serverTimeOffsetMs={serverTimeOffsetMs}
          onClose={() => setSelectedZoneKey(null)}
        />
      )}

      {showOverview && (
        <SponsorsOverviewModal
          zones={zones}
          serverTimeOffsetMs={serverTimeOffsetMs}
          onSelectZone={setSelectedZoneKey}
          onClose={() => setShowOverview(false)}
        />
      )}

      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}

      {showMirror && <MirrorLightboxModal onClose={() => setShowMirror(false)} />}
    </main>
  );
}
