import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, CURRENCY } from "@/lib/stripe";
import { getZoneConfig } from "@/lib/zones.config";

export const dynamic = "force-dynamic";

/**
 * Crée une session Stripe Checkout pour sponsoriser une zone.
 *
 * Sécurité : le prix n'est JAMAIS pris depuis le corps de la requête client.
 * Il est relu depuis la base de données au moment de la création de la
 * session, et à nouveau vérifié dans le webhook avant toute mise à jour.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const zoneKey = typeof (body as any)?.zoneKey === "string" ? (body as any).zoneKey : null;
  if (!zoneKey) {
    return NextResponse.json({ error: "zoneKey manquant." }, { status: 400 });
  }

  const zone = await prisma.zone.findUnique({ where: { key: zoneKey } });
  if (!zone) {
    return NextResponse.json({ error: "Zone introuvable." }, { status: 404 });
  }

  if (zone.deadline.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Les enchères pour cette zone sont closes." }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Le paiement n'est pas encore configuré sur ce site (clé Stripe manquante)." },
      { status: 503 },
    );
  }

  const config = getZoneConfig(zone.key);
  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: zone.currentPriceCents,
            product_data: {
              name: `Sponsoring corporel — ${zone.label}`,
              description:
                `Ton logo affiché sur la zone "${zone.label}" de l'athlète, visible par tous les ` +
                `visiteurs du site jusqu'à ce qu'une nouvelle marque surenchérisse (remboursement ` +
                `automatique si tu es surenchéri avant le ${zone.deadline.toLocaleDateString("fr-FR")}).`,
            },
          },
        },
      ],
      metadata: {
        zoneId: zone.id,
        zoneKey: zone.key,
        expectedAmountCents: String(zone.currentPriceCents),
        priceVersion: String(zone.priceVersion),
      },
      success_url: `${origin}/upload/{CHECKOUT_SESSION_ID}?paid=1`,
      cancel_url: `${origin}/?canceled=${zone.key}`,
    });
  } catch (err) {
    console.error("[checkout] Échec de création de la session Stripe:", err);
    return NextResponse.json(
      { error: "Le paiement est momentanément indisponible. Réessaie dans un instant." },
      { status: 502 },
    );
  }

  if (!session.url) {
    return NextResponse.json({ error: "Impossible de créer la session de paiement." }, { status: 502 });
  }

  return NextResponse.json({ url: session.url, zoneLabel: config?.label ?? zone.label });
}
