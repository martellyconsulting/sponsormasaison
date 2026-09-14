import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  // On ne throw pas au chargement du module pour ne pas casser le build
  // (les routes qui l'utilisent vérifient/échouent proprement à l'exécution).
  console.warn(
    "[stripe] STRIPE_SECRET_KEY est manquant — les paiements ne fonctionneront pas tant que la variable n'est pas configurée.",
  );
}

export const stripe = new Stripe(secretKey ?? "sk_test_missing", {
  apiVersion: "2026-08-26.dahlia",
  typescript: true,
});

export const CURRENCY = "eur";
