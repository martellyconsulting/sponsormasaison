import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toZoneDTO } from "@/lib/zoneDto";
import type { ZonesResponse } from "@/types/zone";
import { ZONES, defaultDeadline } from "@/lib/zones.config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Endpoint public, sondé (polling) par tous les visiteurs pour rafraîchir
// prix / sponsors / logos en quasi temps réel, sans recharger la page.
export async function GET() {
  let zones = await prisma.zone.findMany({ orderBy: { order: "asc" } });

  // Auto-réparation : si de nouvelles zones sont ajoutées à zones.config.ts
  // (ex. pec gauche/droit), on les crée en base au premier appel plutôt que
  // de dépendre d'un reseed manuel de la base de production.
  const existingKeys = new Set(zones.map((z) => z.key));
  const missing = ZONES.filter((z) => !existingKeys.has(z.key));
  if (missing.length > 0) {
    const deadline = defaultDeadline();
    await prisma.zone.createMany({
      data: missing.map((z) => ({
        key: z.key,
        label: z.label,
        order: z.order,
        basePriceCents: z.basePriceCents,
        currentPriceCents: z.basePriceCents,
        deadline,
      })),
      skipDuplicates: true,
    });
    zones = await prisma.zone.findMany({ orderBy: { order: "asc" } });
  }

  const activeIds = zones.map((z) => z.activeSponsorshipId).filter((id): id is string => !!id);

  const sponsorships = activeIds.length
    ? await prisma.sponsorship.findMany({ where: { id: { in: activeIds } } })
    : [];
  const sponsorshipById = new Map(sponsorships.map((s) => [s.id, s]));

  const body: ZonesResponse = {
    zones: zones.map((z) =>
      toZoneDTO(z, z.activeSponsorshipId ? sponsorshipById.get(z.activeSponsorshipId) ?? null : null),
    ),
    serverTime: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    headers: { "Cache-Control": "no-store" },
  });
}
