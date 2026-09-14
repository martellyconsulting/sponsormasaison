"use client";

import type { ZoneDTO } from "@/types/zone";
import { formatCents } from "@/lib/format";
import { Countdown } from "./Countdown";

export function ZoneList({
  zones,
  serverTimeOffsetMs,
  onSelect,
  selectedZoneKey,
}: {
  zones: ZoneDTO[];
  serverTimeOffsetMs: number;
  onSelect: (key: string) => void;
  selectedZoneKey: string | null;
}) {
  const sorted = [...zones].sort((a, b) => a.order - b.order);

  return (
    <ul className="space-y-2">
      {sorted.map((zone) => (
        <li key={zone.key}>
          <button
            onClick={() => onSelect(zone.key)}
            className={`w-full rounded-xl border px-4 py-3 text-left transition ${
              selectedZoneKey === zone.key
                ? "border-arena-volt bg-arena-volt/10"
                : "border-arena-line bg-arena-panel/60 hover:border-arena-steel"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-sm sm:text-base">{zone.label}</p>
                <p className="truncate text-xs text-arena-steel">
                  {zone.sponsor
                    ? zone.sponsor.sponsorName ?? "Sponsor confirmé — logo en cours"
                    : "Zone disponible"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-arena-volt">{formatCents(zone.currentPriceCents)}</p>
                <Countdown deadline={zone.deadline} serverTimeOffsetMs={serverTimeOffsetMs} compact />
              </div>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
