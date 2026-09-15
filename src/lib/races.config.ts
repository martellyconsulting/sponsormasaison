// Calendrier des courses de la saison.

export type Race = {
  id: string;
  name: string;
  shortName: string;
  date: string; // ISO 8601
  location: string;
  discipline: "hyrox-solo" | "hyrox-duo" | "marathon";
};

export const RACES: Race[] = [
  {
    id: "hyrox-solo-pro",
    name: "Hyrox Solo Pro",
    shortName: "Hyrox Solo",
    date: "2026-10-30T08:00:00.000Z",
    location: "À confirmer",
    discipline: "hyrox-solo",
  },
  {
    id: "hyrox-duo",
    name: "Hyrox Duo",
    shortName: "Hyrox Duo",
    date: "2026-11-01T08:00:00.000Z",
    location: "À confirmer",
    discipline: "hyrox-duo",
  },
  {
    id: "marathon",
    name: "Marathon Nice-Cannes",
    shortName: "Marathon",
    date: "2026-11-07T08:00:00.000Z",
    location: "Nice - Cannes",
    discipline: "marathon",
  },
];

/** Dernière course de la saison — utilisée comme deadline par défaut des enchères. */
export function seasonEndDate(): Date {
  return RACES.reduce(
    (latest, race) => (new Date(race.date) > latest ? new Date(race.date) : latest),
    new Date(RACES[0]!.date),
  );
}

export function nextRace(from: Date = new Date()): Race | null {
  const upcoming = RACES.filter((r) => new Date(r.date).getTime() > from.getTime()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  return upcoming[0] ?? null;
}
