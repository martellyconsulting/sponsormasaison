import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toZoneDTO } from "@/lib/zoneDto";
import type { ZonesResponse } from "@/types/zone";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Endpoint public, sondé (polling) par tous les visiteurs pour rafraîchir
// prix / sponsors / logos en quasi temps réel, sans recharger la page.
export async function GET() {
  const zones = await prisma.zone.findMany({ orderBy: { order: "asc" } });

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
