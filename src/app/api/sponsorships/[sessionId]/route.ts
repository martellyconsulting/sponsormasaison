import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getZoneConfig } from "@/lib/zones.config";

export const dynamic = "force-dynamic";

/**
 * Statut d'un sponsoring, identifié par l'id de session Stripe Checkout
 * (jeton public non-devinable transmis dans l'URL de la page d'upload).
 *
 * Sondé par la page /upload/[sessionId] car le webhook Stripe peut mettre
 * quelques secondes à arriver après la redirection du navigateur.
 */
export async function GET(_req: NextRequest, { params }: { params: { sessionId: string } }) {
  const sponsorship = await prisma.sponsorship.findUnique({
    where: { stripeCheckoutSessionId: params.sessionId },
  });

  if (!sponsorship) {
    return NextResponse.json({ found: false });
  }

  const zone = await prisma.zone.findUnique({ where: { id: sponsorship.zoneId } });
  const config = zone ? getZoneConfig(zone.key) : undefined;

  return NextResponse.json({
    found: true,
    status: sponsorship.status,
    zoneKey: zone?.key ?? null,
    zoneLabel: config?.label ?? zone?.label ?? null,
    amountPaidCents: sponsorship.amountPaidCents,
    sponsorName: sponsorship.sponsorName,
    sponsorUrl: sponsorship.sponsorUrl,
    logoUrl: sponsorship.logoUrl,
  });
}
