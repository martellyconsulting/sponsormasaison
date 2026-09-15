-- =============================================================================
-- Bootstrap manuel de la base de données (sans avoir besoin d'installer Node)
-- =============================================================================
-- Si tu es à l'aise avec la ligne de commande, préfère plutôt :
--   npx prisma db push && npm run db:seed
-- Ce fichier est une alternative 100% "copier-coller" pour les débutants :
-- colle tout ce fichier dans Supabase → SQL Editor → New query → Run.
--
-- ⚠️ Les dates ci-dessous (deadline) correspondent aux dates de la saison
-- définies dans src/lib/races.config.ts. Si tu changes les dates des
-- courses, pense à relancer un UPDATE (voir README) pour que les enchères
-- se calent sur la bonne deadline.
-- =============================================================================

-- --- Tables -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Zone" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "basePriceCents" INTEGER NOT NULL,
    "currentPriceCents" INTEGER NOT NULL,
    "priceVersion" INTEGER NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3) NOT NULL,
    "activeSponsorshipId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Sponsorship" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "amountPaidCents" INTEGER NOT NULL,
    "stripeCheckoutSessionId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "status" TEXT NOT NULL,
    "sponsorName" TEXT,
    "sponsorUrl" TEXT,
    "logoUrl" TEXT,
    "refundedAmountCents" INTEGER,
    "refundedAt" TIMESTAMP(3),
    "refundReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sponsorship_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Zone_key_key" ON "Zone"("key");
CREATE INDEX IF NOT EXISTS "Zone_activeSponsorshipId_idx" ON "Zone"("activeSponsorshipId");
CREATE UNIQUE INDEX IF NOT EXISTS "Sponsorship_stripeCheckoutSessionId_key" ON "Sponsorship"("stripeCheckoutSessionId");
CREATE INDEX IF NOT EXISTS "Sponsorship_zoneId_idx" ON "Sponsorship"("zoneId");
CREATE INDEX IF NOT EXISTS "Sponsorship_status_idx" ON "Sponsorship"("status");

-- --- Les 12 zones de sponsoring (gauche/droite séparées), avec leur prix
-- de départ (deadline par défaut = date du Marathon, dernière course de la
-- saison — voir src/lib/races.config.ts) ------------------------------------
INSERT INTO "Zone" ("id", "key", "label", "order", "basePriceCents", "currentPriceCents", "deadline", "updatedAt")
VALUES
    ('zone-epaule-gauche',    'epaule_gauche',     'Épaule gauche',     0, 15000, 15000, '2026-11-07T08:00:00.000Z', CURRENT_TIMESTAMP),
    ('zone-epaule-droite',    'epaule_droite',     'Épaule droite',     1, 15000, 15000, '2026-11-07T08:00:00.000Z', CURRENT_TIMESTAMP),
    ('zone-biceps-gauche',    'biceps_gauche',     'Biceps gauche',     2, 10000, 10000, '2026-11-07T08:00:00.000Z', CURRENT_TIMESTAMP),
    ('zone-biceps-droit',     'biceps_droit',      'Biceps droit',      3, 10000, 10000, '2026-11-07T08:00:00.000Z', CURRENT_TIMESTAMP),
    ('zone-avant-bras-g',     'avant_bras_gauche', 'Avant-bras gauche', 4,  8000,  8000, '2026-11-07T08:00:00.000Z', CURRENT_TIMESTAMP),
    ('zone-avant-bras-d',     'avant_bras_droit',  'Avant-bras droit',  5,  8000,  8000, '2026-11-07T08:00:00.000Z', CURRENT_TIMESTAMP),
    ('zone-omoplate-gauche',  'omoplate_gauche',   'Omoplate gauche',   6, 12000, 12000, '2026-11-07T08:00:00.000Z', CURRENT_TIMESTAMP),
    ('zone-omoplate-droite',  'omoplate_droite',   'Omoplate droite',   7, 12000, 12000, '2026-11-07T08:00:00.000Z', CURRENT_TIMESTAMP),
    ('zone-cuisse-gauche',    'cuisse_gauche',     'Cuisse gauche',     8, 18000, 18000, '2026-11-07T08:00:00.000Z', CURRENT_TIMESTAMP),
    ('zone-cuisse-droite',    'cuisse_droite',     'Cuisse droite',     9, 18000, 18000, '2026-11-07T08:00:00.000Z', CURRENT_TIMESTAMP),
    ('zone-mollet-gauche',    'mollet_gauche',     'Mollet gauche',    10,  9000,  9000, '2026-11-07T08:00:00.000Z', CURRENT_TIMESTAMP),
    ('zone-mollet-droit',     'mollet_droit',      'Mollet droit',     11,  9000,  9000, '2026-11-07T08:00:00.000Z', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
