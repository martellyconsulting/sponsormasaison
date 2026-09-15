"use client";

import type { ZoneDTO } from "@/types/zone";
import { ZoneList } from "./ZoneList";

export function SponsorsOverviewModal({
  zones,
  serverTimeOffsetMs,
  onSelectZone,
  onClose,
}: {
  zones: ZoneDTO[];
  serverTimeOffsetMs: number;
  onSelectZone: (key: string) => void;
  onClose: () => void;
}) {
  const sponsoredCount = zones.filter((z) => z.sponsor).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 py-6 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-arena-line bg-arena-panel p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl">Toutes les zones</h3>
            <p className="text-xs text-arena-steel">
              {sponsoredCount}/{zones.length} zones sponsorisées
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full border border-arena-line px-2.5 py-1 text-arena-steel hover:text-white"
          >
            ✕
          </button>
        </div>
        <ZoneList
          zones={zones}
          serverTimeOffsetMs={serverTimeOffsetMs}
          selectedZoneKey={null}
          onSelect={(key) => {
            onClose();
            onSelectZone(key);
          }}
        />
      </div>
    </div>
  );
}
