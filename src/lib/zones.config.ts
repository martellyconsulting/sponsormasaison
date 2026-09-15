import { seasonEndDate } from "./races.config";

export type Vec3 = [number, number, number];

export type ZoneAnchor = {
  /** Position locale (mètres) dans le repère de l'avatar, centré à l'origine. */
  position: Vec3;
  /** Direction vers laquelle le logo doit "faire face" (sera normalisée). */
  normal: Vec3;
  /** Échelle du panneau logo, en mètres (largeur, hauteur). */
  size: [number, number];
};

export type ZoneConfig = {
  key: string;
  label: string;
  shortLabel: string;
  order: number;
  basePriceCents: number;
  /** Chaque zone (même gauche/droite) est indépendante : un sponsor propre. */
  anchor: ZoneAnchor;
};

// ---------------------------------------------------------------------------
// Géométrie de référence de l'avatar (utilisée à la fois par l'avatar de
// secours procédural ET comme repère pour recalibrer les ancres une fois le
// vrai scan .glb chargé — voir public/models/README.md).
// Avatar centré à l'origine, hauteur totale ≈ 1.8, pieds en y ≈ -0.95.
// ---------------------------------------------------------------------------
// Décalage vertical du groupe racine partagé par l'avatar (fallback ET vrai
// scan) et par les ancres de zones dans AvatarCanvas — doit rester synchro
// avec la position du <group> englobant dans AvatarCanvas.tsx, sinon le
// mode calibration (?calibrate=1) donnerait des coordonnées dans le mauvais
// repère.
export const AVATAR_GROUP_Y_OFFSET = -0.05;

export const BODY_DIMENSIONS = {
  totalHeight: 1.8,
  feetY: -0.95,
  hipY: -0.15,
  shoulderY: 0.55,
  headCenterY: 0.78,
  headRadius: 0.12,
  shoulderX: 0.22,
  elbowY: 0.32,
  wristY: 0.08,
  kneeY: -0.5,
  ankleY: -0.85,
};

// Chaque zone bilatérale du corps est vendue séparément à gauche et à
// droite : deux sponsors indépendants peuvent donc cohabiter sur, par
// exemple, l'épaule gauche et l'épaule droite.
//
// Positions calibrées le 15/09/2026 sur le vrai scan de l'athlète
// (public/models/athlete.glb, fourni par le client) via le mode
// ?calibrate=1 — remplace les valeurs approximatives de l'avatar de
// secours procédural. Si le fichier athlete.glb change (nouveau scan),
// recalibrer avec ?calibrate=1 (voir public/models/README.md).
export const ZONES: ZoneConfig[] = [
  {
    key: "epaule_gauche",
    label: "Épaule gauche",
    shortLabel: "Épaule G",
    order: 0,
    basePriceCents: 15000,
    anchor: { position: [-0.095, 0.62, -0.02], normal: [-0.6, 0.4, 0.7], size: [0.14, 0.14] },
  },
  {
    key: "epaule_droite",
    label: "Épaule droite",
    shortLabel: "Épaule D",
    order: 1,
    basePriceCents: 15000,
    anchor: { position: [0.095, 0.654, 0.012], normal: [0.6, 0.4, 0.7], size: [0.14, 0.14] },
  },
  {
    key: "biceps_gauche",
    label: "Biceps gauche",
    shortLabel: "Biceps G",
    order: 2,
    basePriceCents: 10000,
    anchor: { position: [-0.034, 0.411, 0.066], normal: [-0.85, 0, 0.55], size: [0.11, 0.1] },
  },
  {
    key: "biceps_droit",
    label: "Biceps droit",
    shortLabel: "Biceps D",
    order: 3,
    basePriceCents: 10000,
    anchor: { position: [0.099, 0.287, 0.031], normal: [0.85, 0, 0.55], size: [0.11, 0.1] },
  },
  {
    key: "avant_bras_gauche",
    label: "Avant-bras gauche",
    shortLabel: "Avant-bras G",
    order: 4,
    basePriceCents: 8000,
    anchor: { position: [-0.08, 0.232, 0.043], normal: [-0.75, 0, 0.66], size: [0.1, 0.11] },
  },
  {
    key: "avant_bras_droit",
    label: "Avant-bras droit",
    shortLabel: "Avant-bras D",
    order: 5,
    basePriceCents: 8000,
    anchor: { position: [0.266, 0.152, -0.199], normal: [0.75, 0, 0.66], size: [0.1, 0.11] },
  },
  {
    key: "omoplate_gauche",
    label: "Omoplate gauche",
    shortLabel: "Omoplate G",
    order: 6,
    basePriceCents: 12000,
    anchor: { position: [-0.11, 0.49, -0.143], normal: [-0.35, 0.1, -0.94], size: [0.13, 0.13] },
  },
  {
    key: "omoplate_droite",
    label: "Omoplate droite",
    shortLabel: "Omoplate D",
    order: 7,
    basePriceCents: 12000,
    anchor: { position: [0.075, 0.472, -0.27], normal: [0.35, 0.1, -0.94], size: [0.13, 0.13] },
  },
  {
    key: "cuisse_gauche",
    label: "Cuisse gauche",
    shortLabel: "Cuisse G",
    order: 8,
    basePriceCents: 18000,
    anchor: { position: [-0.093, -0.393, 0.041], normal: [-0.55, 0, 0.83], size: [0.15, 0.17] },
  },
  {
    key: "cuisse_droite",
    label: "Cuisse droite",
    shortLabel: "Cuisse D",
    order: 9,
    basePriceCents: 18000,
    anchor: { position: [0.077, -0.354, -0.22], normal: [0.55, 0, 0.83], size: [0.15, 0.17] },
  },
  {
    key: "mollet_gauche",
    label: "Mollet gauche",
    shortLabel: "Mollet G",
    order: 10,
    basePriceCents: 9000,
    anchor: { position: [-0.131, -0.666, -0.001], normal: [-0.4, 0, -0.92], size: [0.11, 0.13] },
  },
  {
    key: "mollet_droit",
    label: "Mollet droit",
    shortLabel: "Mollet D",
    order: 11,
    basePriceCents: 9000,
    anchor: { position: [0.097, -0.62, -0.229], normal: [0.4, 0, -0.92], size: [0.11, 0.13] },
  },
];

export function getZoneConfig(key: string): ZoneConfig | undefined {
  return ZONES.find((z) => z.key === key);
}

export function defaultDeadline(): Date {
  return seasonEndDate();
}
