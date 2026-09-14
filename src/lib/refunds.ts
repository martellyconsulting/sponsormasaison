import type { Sponsorship } from "@prisma/client";
import Stripe from "stripe";
import { prisma } from "./prisma";
import { stripe } from "./stripe";

/**
 * Calcule le montant à rembourser à l'ancien sponsor = montant payé moins
 * les frais Stripe déjà prélevés sur la transaction d'origine (ces frais ne
 * sont jamais restitués par Stripe, quel que soit le montant remboursé).
 * Retourne `undefined` si le calcul échoue — dans ce cas on remboursera
 * intégralement plutôt que de bloquer le remboursement.
 */
export async function computeRefundMinusStripeFee(
  paymentIntentId: string,
): Promise<number | undefined> {
  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge.balance_transaction"],
    });
    const charge = pi.latest_charge;
    if (charge && typeof charge !== "string") {
      const balanceTransaction = charge.balance_transaction;
      if (balanceTransaction && typeof balanceTransaction !== "string") {
        return Math.max(charge.amount - balanceTransaction.fee, 0);
      }
    }
  } catch (err) {
    console.error(
      "[refunds] Impossible de calculer les frais Stripe de la transaction d'origine, " +
        "remboursement intégral appliqué par défaut.",
      err,
    );
  }
  return undefined;
}

export async function issueRefund(params: {
  sponsorship: Sponsorship;
  amountCents?: number; // undefined = remboursement intégral
  finalStatus: "refunded" | "voided";
  reason: string;
}): Promise<void> {
  const { sponsorship, amountCents, finalStatus, reason } = params;

  if (!sponsorship.stripePaymentIntentId) {
    await prisma.sponsorship.update({
      where: { id: sponsorship.id },
      data: { status: finalStatus, refundReason: reason },
    });
    return;
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: sponsorship.stripePaymentIntentId,
      ...(amountCents !== undefined ? { amount: amountCents } : {}),
    });
    await prisma.sponsorship.update({
      where: { id: sponsorship.id },
      data: {
        status: finalStatus,
        refundedAmountCents: refund.amount,
        refundedAt: new Date(),
        refundReason: reason,
      },
    });
  } catch (err) {
    console.error(`[refunds] Échec du remboursement Stripe pour sponsorship ${sponsorship.id}:`, err);
    // On marque quand même le statut final pour ne pas garder une zone dans
    // un état incohérent, mais le motif signale clairement qu'une action
    // manuelle est nécessaire côté Stripe Dashboard.
    await prisma.sponsorship.update({
      where: { id: sponsorship.id },
      data: {
        status: finalStatus,
        refundReason: `${reason} — ÉCHEC du remboursement automatique, vérifier manuellement dans Stripe.`,
      },
    });
  }
}

export type { Stripe };
