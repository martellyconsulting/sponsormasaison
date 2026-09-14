"use client";

import { useEffect, useMemo, useState } from "react";
import { AvatarCanvas } from "@/components/three/AvatarCanvas";
import { ZoneList } from "@/components/ZoneList";
import { RaceCalendar } from "@/components/RaceCalendar";
import { SponsorModal } from "@/components/SponsorModal";
import { Countdown } from "@/components/Countdown";
import { useZones } from "@/hooks/useZones";
import { getZoneConfig } from "@/lib/zones.config";
import { nextRace } from "@/lib/races.config";

export default function HomePage() {
  const { zones, serverTimeOffsetMs, loading, error } = useZones();
  const [selectedZoneKey, setSelectedZoneKey] = useState<string | null>(null);
  const [calibrate, setCalibrate] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("calibrate") === "1") setCalibrate(true);
    if (params.get("paid") === "1") setNotice("Paiement confirmé — merci ! Complète le formulaire pour afficher ton logo.");
    const canceled = params.get("canceled");
    if (canceled) setNotice(`Paiement annulé pour la zone "${canceled}".`);
  }, []);

  const selectedZone = useMemo(
    () => zones.find((z) => z.key === selectedZoneKey) ?? null,
    [zones, selectedZoneKey],
  );
  const selectedConfig = selectedZoneKey ? getZoneConfig(selectedZoneKey) : undefined;

  const upcoming = nextRace();
  const globalDeadline = zones[0]?.deadline;

  return (
    <main className="min-h-screen bg-arena-bg bg-grid-fade">
      <header className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-arena-volt">Saison en cours</p>
          <h1 className="font-display text-2xl sm:text-3xl leading-tight">
            SPONSORISE <span className="text-arena-ember">MA SAISON</span>
          </h1>
        </div>
        {upcoming && (
          <div className="hidden sm:block text-right">
            <p className="text-[11px] uppercase tracking-widest text-arena-steel">Prochaine course</p>
            <p className="font-display">{upcoming.name}</p>
          </div>
        )}
      </header>

      {notice && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-2 flex items-center justify-between rounded-lg border border-arena-volt/40 bg-arena-volt/10 px-4 py-2 text-sm">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} className="text-arena-steel hover:text-white">
              ✕
            </button>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-8 grid grid-cols-1 lg:grid-cols-[1fr_1.3fr_1fr] gap-4 sm:gap-6">
        {/* Colonne gauche — calendrier + pitch */}
        <div className="order-2 lg:order-1 space-y-4">
          <div className="rounded-2xl border border-arena-line bg-arena-panel/50 p-4 sm:p-5">
            <h2 className="font-display text-sm uppercase tracking-widest text-arena-steel mb-3">
              Calendrier de saison
            </h2>
            <RaceCalendar />
          </div>
          <div className="rounded-2xl border border-arena-line bg-arena-panel/50 p-4 sm:p-5">
            <h2 className="font-display text-sm uppercase tracking-widest text-arena-steel mb-2">
              Le concept
            </h2>
            <p className="text-sm text-arena-steel leading-relaxed">
              Chaque zone de mon corps est une surface de sponsoring. Une marque paie, son logo
              s'affiche en direct sur mon avatar 3D, visible par tous. Si une autre marque
              surenchérit avant la deadline, le prix double et l'ancien sponsor est remboursé
              automatiquement.
            </p>
          </div>
        </div>

        {/* Colonne centrale — avatar 3D */}
        <div className="order-1 lg:order-2 flex flex-col items-center">
          <div className="w-full aspect-square sm:aspect-[4/5] max-h-[70vh] rounded-2xl border border-arena-line bg-black/30 overflow-hidden relative">
            {loading && zones.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-arena-steel text-sm">
                Chargement de l'avatar…
              </div>
            )}
            <AvatarCanvas
              zones={zones}
              onSelectZone={setSelectedZoneKey}
              selectedZoneKey={selectedZoneKey}
              calibrate={calibrate}
            />
          </div>
          {globalDeadline && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-[11px] uppercase tracking-widest text-arena-steel">
                Fin des enchères de la saison
              </p>
              <Countdown deadline={globalDeadline} serverTimeOffsetMs={serverTimeOffsetMs} />
            </div>
          )}
          {error && <p className="mt-2 text-xs text-arena-ember">Connexion au serveur perdue, nouvelle tentative…</p>}
        </div>

        {/* Colonne droite — liste des zones */}
        <div className="order-3 space-y-3">
          <h2 className="font-display text-sm uppercase tracking-widest text-arena-steel">
            Zones disponibles
          </h2>
          <ZoneList
            zones={zones}
            serverTimeOffsetMs={serverTimeOffsetMs}
            onSelect={setSelectedZoneKey}
            selectedZoneKey={selectedZoneKey}
          />
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-4 sm:px-6 pb-8 text-center text-[11px] text-arena-steel">
        Paiements traités par Stripe. Site en mode démonstration tant que les clés Stripe de
        production ne sont pas configurées.
      </footer>

      {selectedZone && selectedConfig && (
        <SponsorModal
          zone={selectedZone}
          config={selectedConfig}
          serverTimeOffsetMs={serverTimeOffsetMs}
          onClose={() => setSelectedZoneKey(null)}
        />
      )}
    </main>
  );
}
