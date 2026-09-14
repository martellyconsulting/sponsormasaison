-- =============================================================================
-- Bootstrap manuel de la base de données (sans avoir besoin d'installer Node)
-- =============================================================================
-- Si tu es à l'aise avec la ligne de commande, préfère plutôt :
--   npx prisma db push && npm run db:seed
-- Ce fichier est une alternative 100% "copier-coller" pour les débutants :
-- colle tout ce fichier dans Supabase → SQL Editor → New query → Run.
--
-- ⚠️ Les dates ci-dessous (deadline) correspondent aux dates de démonstration
-- de src/lib/races.config.ts. Si tu changes les vraies dates des courses,
-- pense à relancer un UPDATE (voir README) pour que les enchères se calent
-- sur la bonne deadline.
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

-- --- Les 6 zones de sponsoring, avec leur prix de départ ------------------
-- (deadline par défaut = date du Marathon, dernière course de la saison —
-- voir src/lib/races.config.ts)
INSERT INTO "Zone" ("id", "key", "label", "order", "basePriceCents", "currentPriceCents", "deadline", "updatedAt")
VALUES
    ('zone-epaules',    'epaules',    'Épaules',      0, 15000, 15000, '2026-10-11T08:00:00.000Z', CURRENT_TIMESTAMP),
    ('zone-biceps',     'biceps',     'Biceps',       1, 10000, 10000, '2026-10-11T08:00:00.000Z', CURRENT_TIMESTAMP),
    ('zone-avant-bras', 'avant_bras', 'Avant-bras',   2,  8000,  8000, '2026-10-11T08:00:00.000Z', CURRENT_TIMESTAMP),
    ('zone-omoplates',  'omoplates',  'Omoplates',    3, 12000, 12000, '2026-10-11T08:00:00.000Z', CURRENT_TIMESTAMP),
    ('zone-cuisses',    'cuisses',    'Cuisses',      4, 18000, 18000, '2026-10-11T08:00:00.000Z', CURRENT_TIMESTAMP),
    ('zone-mollets',    'mollets',    'Mollets',      5,  9000,  9000, '2026-10-11T08:00:00.000Z', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
