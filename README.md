# Sponsorise ma saison

Site de sponsoring corporel pour athlète : les marques enchérissent sur des
zones du corps (épaules, biceps, avant-bras, omoplates, cuisses, mollets)
affichées sur un avatar 3D. Le paiement, le doublement du prix, le
remboursement automatique de l'ancien sponsor et l'affichage du logo sont
100% automatisés — aucune intervention manuelle nécessaire après la mise en
production.

## Comment ça marche

1. Un visiteur clique sur une zone du corps (sur l'avatar 3D ou dans la
   liste) et paie via Stripe Checkout, au prix actuel affiché.
2. Le webhook Stripe (`checkout.session.completed`) est l'unique déclencheur
   des mises à jour : il revérifie le montant réellement payé côté serveur,
   double le prix de la zone pour la prochaine enchère, et rembourse
   automatiquement l'ancien sponsor (montant payé **moins les frais Stripe**
   déjà prélevés sur sa transaction).
3. Le sponsor est redirigé vers une page `/upload/[session]` où il dépose son
   logo et renseigne son nom/lien — sans que l'athlète n'ait à intervenir.
4. Tous les visiteurs voient le nouveau logo et le nouveau prix apparaître
   automatiquement (rafraîchissement toutes les 7s), sans recharger la page.
5. Tant qu'un sponsor n'a pas encore uploadé son logo, un badge texte généré
   automatiquement (nom de la marque, ou "zone libre") s'affiche à sa place.

## Stack

- **Frontend** : Next.js 14 (App Router) + Tailwind CSS
- **3D** : Three.js via `@react-three/fiber` + `@react-three/drei`
- **Backend** : API routes Next.js (Node.js runtime)
- **Base de données** : Postgres + Prisma ORM
- **Paiement** : Stripe Checkout + Webhooks + Refunds API
- **Stockage des logos** : Vercel Blob (repli automatique sur le disque local
  en développement si aucun token n'est configuré)
- **Temps réel** : polling léger (7s) — suffisant pour un rythme d'enchères
  humaines, pas besoin de WebSocket

## Schéma de base de données

Voir `prisma/schema.prisma`. Deux tables :

- **Zone** : `key`, `label`, `basePriceCents`, `currentPriceCents`,
  `priceVersion` (verrou optimiste anti-double-paiement simultané),
  `deadline`, `activeSponsorshipId`.
- **Sponsorship** : une transaction de sponsoring — `zoneId`,
  `amountPaidCents`, `stripeCheckoutSessionId` (sert aussi de jeton d'accès
  non-devinable à la page d'upload), `stripePaymentIntentId`, `status`
  (`pending_upload` / `active` / `refunded` / `voided`), `sponsorName`,
  `sponsorUrl`, `logoUrl`, `refundedAmountCents`, `refundedAt`.

## Sécurité (paiement)

- Le prix à payer n'est **jamais** lu depuis le client : il est recalculé
  côté serveur (`POST /api/checkout`) à partir de la base de données.
- Le webhook Stripe revérifie que le montant réellement encaissé
  (`session.amount_total`) correspond exactement au montant attendu capturé
  à la création de la session ; en cas de divergence, le paiement est
  ignoré et remboursé automatiquement par précaution.
- Un verrou optimiste (`priceVersion`) protège contre le cas rare de deux
  paiements validés quasi simultanément sur la même zone au même prix : le
  paiement "perdant" est automatiquement et intégralement remboursé.
- Toute action serveur qui modifie une zone est faite en `updateMany`
  conditionnel (compare-and-swap), jamais en te fiant à un état lu
  précédemment côté client.

## Démarrage local

```bash
npm install
cp .env.example .env   # puis renseigne les variables (voir sections ci-dessous)
npx prisma db push     # crée les tables dans ta base Postgres
npm run db:seed        # crée les 6 zones avec leurs prix de départ
npm run dev
```

Le site est utilisable immédiatement avec un **avatar 3D de secours**
(silhouette procédurale) tant que le vrai scan corporel n'est pas fourni —
voir `public/models/README.md` pour l'intégrer et recalibrer les zones.

## Configurer Stripe

### Mode test (développement)

1. Crée un compte Stripe (ou utilise un compte existant) et reste en mode
   **Test** (bascule en haut à droite du dashboard).
2. Récupère tes clés sur
   [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys) :
   - `STRIPE_SECRET_KEY` = clé secrète (`sk_test_...`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = clé publique (`pk_test_...`,
     non utilisée directement ici mais gardée pour extension future)
3. Installe la [Stripe CLI](https://stripe.com/docs/stripe-cli) et lance,
   dans un terminal séparé pendant que `npm run dev` tourne :
   ```bash
   stripe login
   npm run stripe:listen
   # équivalent à : stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   La CLI affiche un secret `whsec_...` : mets-le dans `STRIPE_WEBHOOK_SECRET`.
4. Teste un paiement avec une carte de test Stripe, par exemple
   `4242 4242 4242 4242`, une date future et un CVC quelconque.

### Mode production

1. Bascule le dashboard Stripe en mode **Live** et récupère les clés
   `sk_live_...` / `pk_live_...`.
2. Dans Stripe Dashboard → **Développeurs → Webhooks**, ajoute un endpoint :
   `https://ton-domaine.com/api/webhooks/stripe`, événement
   `checkout.session.completed`. Stripe te donne un secret `whsec_...` à
   mettre dans `STRIPE_WEBHOOK_SECRET` de ton environnement de production.
3. Renseigne `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` et
   `STRIPE_WEBHOOK_SECRET` (les clés live) dans les variables d'environnement
   Vercel du projet.

⚠️ Les remboursements Stripe ne restituent jamais les frais Stripe déjà
prélevés sur la transaction d'origine — c'est pour cette raison que le
remboursement de l'ancien sponsor est calculé comme
`montant payé − frais Stripe de la transaction`, conformément à la demande.

## Déploiement (Vercel + Supabase recommandé)

1. **Base de données (Supabase)**
   - Crée un projet sur [supabase.com](https://supabase.com).
   - Récupère la "Connection string" en mode **connection pooling**
     (Project Settings → Database) et mets-la dans `DATABASE_URL`.
   - Depuis ta machine (avec `DATABASE_URL` pointant sur Supabase) :
     ```bash
     npx prisma db push
     npm run db:seed
     ```
2. **Stockage des logos (Vercel Blob)**
   - Dans le dashboard Vercel du projet : **Storage → Create → Blob**.
   - Vercel ajoute automatiquement `BLOB_READ_WRITE_TOKEN` aux variables
     d'environnement du projet — rien à faire de plus.
3. **Déploiement**
   - Connecte le repo GitHub à Vercel (ou `vercel --prod` en CLI).
   - Renseigne dans Vercel → Settings → Environment Variables : `DATABASE_URL`,
     `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
     `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL` (l'URL finale du site).
   - Déploie. Ajoute ensuite l'URL de webhook Stripe pointant vers ce domaine
     (voir section Stripe ci-dessus).
4. **Scan corporel réel**
   - Dépose `athlete.glb` dans `public/models/` de ton dépôt (ou upload-le
     directement dans le déploiement si ton hébergement le permet), puis
     redéploie. Voir `public/models/README.md` pour recalibrer les zones.

## Dates des courses

Les dates du calendrier (Hyrox Solo Pro, Hyrox Duo, Marathon) sont des
valeurs de démonstration dans `src/lib/races.config.ts`, clairement
marquées `TODO`. Remplace-les par les vraies dates de la saison — c'est le
seul endroit à modifier, l'affichage et la deadline globale des enchères en
dépendent automatiquement.

## Limites connues / pistes d'amélioration

- Le remboursement automatique dépend de la disponibilité de l'API Stripe au
  moment du webhook ; en cas d'échec réseau ponctuel, l'erreur est journalisée
  et le motif de remboursement est marqué "ÉCHEC" en base pour un contrôle
  manuel dans le Dashboard Stripe (voir `src/lib/refunds.ts`).
- Le repli de stockage local des logos (`public/uploads`) ne fonctionne qu'en
  développement — configure Vercel Blob avant la mise en production.
- Next.js est volontairement maintenu sur la branche `14.2.x` (dernière
  version patchée de cette branche) plutôt que la dernière version majeure,
  pour rester compatible avec l'API des routes utilisée dans ce projet ;
  une montée vers Next 15/16 est possible mais demande d'adapter la
  signature des route handlers (paramètres dynamiques asynchrones).
