-- =============================================================================
-- Migration : passage de 6 zones groupées (gauche+droite ensemble) à 12
-- zones indépendantes (une par côté). À exécuter UNE SEULE FOIS dans
-- Supabase → SQL Editor → New query → Run, sur une base qui a encore les
-- anciennes zones ("epaules", "biceps", "avant_bras", "omoplates",
-- "cuisses", "mollets").
--
-- ⚠️ Ceci supprime les zones et sponsorings existants avant de recréer les
-- 12 nouvelles zones. À utiliser uniquement s'il n'y a pas encore eu de
-- vrai paiement sponsor sur le site (sinon, contacte-moi avant de lancer
-- ça pour qu'on migre les sponsors actifs sans les perdre).
-- =============================================================================

DELETE FROM "Sponsorship";
DELETE FROM "Zone";

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
    ('zone-mollet-droit',     'mollet_droit',      'Mollet droit',     11,  9000,  9000, '2026-11-07T08:00:00.000Z', CURRENT_TIMESTAMP);
