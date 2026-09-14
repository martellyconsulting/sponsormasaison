import { RACES } from "@/lib/races.config";
import { formatDate } from "@/lib/format";

const DISCIPLINE_ICON: Record<string, string> = {
  "hyrox-solo": "◆",
  "hyrox-duo": "◆◆",
  marathon: "●",
};

export function RaceCalendar() {
  return (
    <ol className="space-y-3">
      {RACES.map((race) => {
        const isPast = new Date(race.date).getTime() < Date.now();
        return (
          <li
            key={race.id}
            className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ${
              isPast ? "border-arena-line/60 opacity-40" : "border-arena-line bg-arena-panel/60"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-display text-arena-volt text-sm shrink-0" aria-hidden>
                {DISCIPLINE_ICON[race.discipline] ?? "●"}
              </span>
              <div className="min-w-0">
                <p className="font-display text-sm sm:text-base truncate">{race.name}</p>
                <p className="text-xs text-arena-steel truncate">{race.location}</p>
              </div>
            </div>
            <time dateTime={race.date} className="text-xs sm:text-sm text-arena-steel shrink-0 text-right">
              {formatDate(race.date)}
            </time>
          </li>
        );
      })}
    </ol>
  );
}
