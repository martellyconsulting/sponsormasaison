import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { computeRefundMinusStripeFee, issueRefund } from "@/lib/refunds";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook Stripe — seule source de vérité pour valider un paiement.
 *
 * Le navigateur du sponsor n'est JAMAIS crédité de confiance : toute mise à
 * jour de zone (nouveau sponsor, doublement du prix, remboursement de
 * l'ancien sponsor) part uniquement d'un événement Stripe signé et vérifié
 * ici, avec re-vérification du montant réellement payé.
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET manquant côté serveur.");
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] Signature invalide:", err);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const zoneId = session.metadata?.zoneId;
  const zoneKey = session.metadata?.zoneKey;
  const expectedAmountCents = Number(session.metadata?.expectedAmountCents);
  const priceVersion = Number(session.metadata?.priceVersion);

  if (!zoneId || !Number.isFinite(expectedAmountCents) || !Number.isFinite(priceVersion)) {
    console.error("[stripe-webhook] Métadonnées de session invalides/manquantes pour", session.id);
    return NextResponse.json({ received: true });
  }

  // Idempotence : Stripe peut livrer le même événement plusieurs fois.
  const alreadyProcessed = await prisma.sponsorship.findUnique({
    where: { stripeCheckoutSessionId: session.id },
  });
  if (alreadyProcessed) {
    return NextResponse.json({ received: true });
  }

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  // Sécurité : le montant réellement encaissé par Stripe doit correspondre
  // exactement au prix capturé côté serveur au moment de la création de la
  // session. Toute divergence est traitée comme suspecte et remboursée.
  if (session.amount_total !== expectedAmountCents) {
    console.error(
      `[stripe-webhook] Montant payé (${session.amount_total}) ≠ montant attendu ` +
        `(${expectedAmountCents}) pour la session ${session.id}. Paiement ignoré et remboursé par sécurité.`,
    );
    if (paymentIntentId) {
      try {
        await stripe.refunds.create({ payment_intent: paymentIntentId });
      } catch (err) {
        console.error("[stripe-webhook] Échec du remboursement de sécurité:", err);
      }
    }
    return NextResponse.json({ received: true });
  }

  const zoneBefore = await prisma.zone.findUnique({ where: { id: zoneId } });
  if (!zoneBefore) {
    console.error(`[stripe-webhook] Zone ${zoneId} introuvable pour la session ${session.id}`);
    return NextResponse.json({ received: true });
  }

  const previousSponsorshipId = zoneBefore.activeSponsorshipId;

  let newSponsorship;
  try {
    newSponsorship = await prisma.sponsorship.create({
      data: {
        zoneId,
        amountPaidCents: session.amount_total,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        status: "pending_upload",
      },
    });
  } catch (err: unknown) {
    const code = (err as { code?: string } | null)?.code;
    if (code === "P2002") {
      // Créé entre-temps par une livraison concurrente du même événement Stripe.
      return NextResponse.json({ received: true });
    }
    throw err;
  }

  // Compare-and-swap optimiste : ce paiement n'est accepté comme "gagnant"
  // que si aucune autre transaction n'a déjà fait avancer cette zone entre
  // la création de la session et la confirmation du paiement (deux sponsors
  // payant au même prix quasi simultanément).
  const cas = await prisma.zone.updateMany({
    where: { id: zoneId, priceVersion, currentPriceCents: expectedAmountCents },
    data: {
      activeSponsorshipId: newSponsorship.id,
      currentPriceCents: expectedAmountCents * 2,
      priceVersion: { increment: 1 },
    },
  });

  if (cas.count === 0) {
    console.warn(
      `[stripe-webhook] Enchère déjà dépassée pour la zone ${zoneKey} au moment de la confirmation ` +
        `du paiement (${session.id}) — remboursement intégral du sponsor évincé.`,
    );
    await issueRefund({
      sponsorship: newSponsorship,
      finalStatus: "voided",
      reason:
        "Un autre sponsor a validé son paiement au même instant sur cette zone — remboursement intégral.",
    });
    return NextResponse.json({ received: true });
  }

  if (previousSponsorshipId) {
    const previous = await prisma.sponsorship.findUnique({ where: { id: previousSponsorshipId } });
    if (previous && previous.status !== "refunded" && previous.stripePaymentIntentId) {
      const refundAmount = await computeRefundMinusStripeFee(previous.stripePaymentIntentId);
      await issueRefund({
        sponsorship: previous,
        amountCents: refundAmount,
        finalStatus: "refunded",
        reason: "Zone resurenchérie par une nouvelle marque avant la deadline.",
      });
    }
  }

  return NextResponse.json({ received: true });
}
