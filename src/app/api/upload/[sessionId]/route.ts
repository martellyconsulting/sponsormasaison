import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ALLOWED_LOGO_TYPES, MAX_LOGO_BYTES, storeLogo } from "@/lib/blob";

export const dynamic = "force-dynamic";

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Formulaire post-paiement : le sponsor (déjà débité par Stripe) dépose son
 * logo et renseigne son nom/lien. Cette route n'a besoin d'aucune
 * intervention de l'athlète — accessible uniquement via l'id de session
 * Stripe Checkout, connu du seul sponsor qui vient de payer.
 */
export async function POST(req: NextRequest, { params }: { params: { sessionId: string } }) {
  const sponsorship = await prisma.sponsorship.findUnique({
    where: { stripeCheckoutSessionId: params.sessionId },
  });

  if (!sponsorship) {
    return NextResponse.json({ error: "Sponsoring introuvable." }, { status: 404 });
  }
  if (sponsorship.status === "voided" || sponsorship.status === "refunded") {
    return NextResponse.json(
      { error: "Ce paiement a été remboursé, l'upload n'est plus disponible." },
      { status: 410 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }

  const sponsorName = String(form.get("sponsorName") ?? "").trim();
  const sponsorUrlRaw = String(form.get("sponsorUrl") ?? "").trim();
  const logo = form.get("logo");

  if (!sponsorName || sponsorName.length > 80) {
    return NextResponse.json({ error: "Nom de marque invalide (1 à 80 caractères)." }, { status: 400 });
  }

  let sponsorUrl: string | null = null;
  if (sponsorUrlRaw) {
    const normalized = /^https?:\/\//i.test(sponsorUrlRaw) ? sponsorUrlRaw : `https://${sponsorUrlRaw}`;
    if (!isValidHttpUrl(normalized)) {
      return NextResponse.json({ error: "Lien du sponsor invalide." }, { status: 400 });
    }
    sponsorUrl = normalized;
  }

  let logoUrl = sponsorship.logoUrl;
  if (logo instanceof File && logo.size > 0) {
    if (!ALLOWED_LOGO_TYPES.includes(logo.type as (typeof ALLOWED_LOGO_TYPES)[number])) {
      return NextResponse.json(
        { error: "Format de logo non supporté (PNG, JPG, WebP ou SVG uniquement)." },
        { status: 400 },
      );
    }
    if (logo.size > MAX_LOGO_BYTES) {
      return NextResponse.json({ error: "Le logo dépasse la taille maximale de 4 Mo." }, { status: 400 });
    }

    const zone = await prisma.zone.findUnique({ where: { id: sponsorship.zoneId } });
    logoUrl = await storeLogo(logo, zone?.key ?? "sponsor");
  } else if (!logoUrl) {
    return NextResponse.json({ error: "Merci de joindre un logo." }, { status: 400 });
  }

  const updated = await prisma.sponsorship.update({
    where: { id: sponsorship.id },
    data: { sponsorName, sponsorUrl, logoUrl, status: "active" },
  });

  return NextResponse.json({
    ok: true,
    sponsorName: updated.sponsorName,
    sponsorUrl: updated.sponsorUrl,
    logoUrl: updated.logoUrl,
  });
}
