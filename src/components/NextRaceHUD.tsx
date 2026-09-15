"use client";

import { useState } from "react";
import { RACES, nextRace } from "@/lib/races.config";
import { formatDate } from "@/lib/format";
import { Countdown } from "./Countdown";

/** Widget compact "prochaine course" — cliquer déplie le calendrier complet de la saison. */
export function NextRaceHUD() {
  const [open, setOpen] = useState(false);
  const upcoming = nextRace();
  if (!upcoming) return null;

  return (
    <div className="pointer-events-auto text-right">
      <button
        onClick={() => setOpen((o) => !o)}
        className="group block w-full text-right"
        aria-expanded={open}
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-arena-steel">Prochaine course</p>
        <p className="font-display text-sm sm:text-base transition-colors group-hover:text-arena-volt">
          {upcoming.shortName}
          <span className="ml-1 inline-block text-arena-steel transition-transform group-hover:translate-y-0.5">
            {open ? "▴" : "▾"}
          </span>
        </p>
      </button>
      <div className="mt-1 flex justify-end">
        <Countdown deadline={upcoming.date} compact />
      </div>

      {open && (
        <div className="mt-3 w-60 rounded-xl border border-arena-line bg-arena-panel/90 p-3 text-left backdrop-blur-sm animate-flip-in">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-arena-steel">
            Calendrier de saison
          </p>
          <ul className="space-y-1.5">
            {RACES.map((race) => (
              <li key={race.id} className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate">{race.name}</span>
                <span className="shrink-0 text-arena-steel">{formatDate(race.date)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
