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
export const ZONES: ZoneConfig[] = [
  {
    key: "epaule_gauche",
    label: "Épaule gauche",
    shortLabel: "Épaule G",
    order: 0,
    basePriceCents: 15000,
    anchor: { position: [-0.26, 0.56, 0.05], normal: [-0.6, 0.4, 0.7], size: [0.16, 0.16] },
  },
  {
    key: "epaule_droite",
    label: "Épaule droite",
    shortLabel: "Épaule D",
    order: 1,
    basePriceCents: 15000,
    anchor: { position: [0.26, 0.56, 0.05], normal: [0.6, 0.4, 0.7], size: [0.16, 0.16] },
  },
  {
    key: "biceps_gauche",
    label: "Biceps gauche",
    shortLabel: "Biceps G",
    order: 2,
    basePriceCents: 10000,
    anchor: { position: [-0.31, 0.42, 0.06], normal: [-0.85, 0, 0.55], size: [0.14, 0.12] },
  },
  {
    key: "biceps_droit",
    label: "Biceps droit",
    shortLabel: "Biceps D",
    order: 3,
    basePriceCents: 10000,
    anchor: { position: [0.31, 0.42, 0.06], normal: [0.85, 0, 0.55], size: [0.14, 0.12] },
  },
  {
    key: "avant_bras_gauche",
    label: "Avant-bras gauche",
    shortLabel: "Avant-bras G",
    order: 4,
    basePriceCents: 8000,
    anchor: { position: [-0.33, 0.16, 0.08], normal: [-0.75, 0, 0.66], size: [0.13, 0.14] },
  },
  {
    key: "avant_bras_droit",
    label: "Avant-bras droit",
    shortLabel: "Avant-bras D",
    order: 5,
    basePriceCents: 8000,
    anchor: { position: [0.33, 0.16, 0.08], normal: [0.75, 0, 0.66], size: [0.13, 0.14] },
  },
  {
    key: "omoplate_gauche",
    label: "Omoplate gauche",
    shortLabel: "Omoplate G",
    order: 6,
    basePriceCents: 12000,
    anchor: { position: [-0.13, 0.48, -0.15], normal: [-0.35, 0.1, -0.94], size: [0.15, 0.15] },
  },
  {
    key: "omoplate_droite",
    label: "Omoplate droite",
    shortLabel: "Omoplate D",
    order: 7,
    basePriceCents: 12000,
    anchor: { position: [0.13, 0.48, -0.15], normal: [0.35, 0.1, -0.94], size: [0.15, 0.15] },
  },
  {
    key: "cuisse_gauche",
    label: "Cuisse gauche",
    shortLabel: "Cuisse G",
    order: 8,
    basePriceCents: 18000,
    anchor: { position: [-0.13, -0.42, 0.1], normal: [-0.55, 0, 0.83], size: [0.18, 0.2] },
  },
  {
    key: "cuisse_droite",
    label: "Cuisse droite",
    shortLabel: "Cuisse D",
    order: 9,
    basePriceCents: 18000,
    anchor: { position: [0.13, -0.42, 0.1], normal: [0.55, 0, 0.83], size: [0.18, 0.2] },
  },
  {
    key: "mollet_gauche",
    label: "Mollet gauche",
    shortLabel: "Mollet G",
    order: 10,
    basePriceCents: 9000,
    anchor: { position: [-0.12, -0.72, -0.08], normal: [-0.4, 0, -0.92], size: [0.13, 0.16] },
  },
  {
    key: "mollet_droit",
    label: "Mollet droit",
    shortLabel: "Mollet D",
    order: 11,
    basePriceCents: 9000,
    anchor: { position: [0.12, -0.72, -0.08], normal: [0.4, 0, -0.92], size: [0.13, 0.16] },
  },
];

export function getZoneConfig(key: string): ZoneConfig | undefined {
  return ZONES.find((z) => z.key === key);
}

export function defaultDeadline(): Date {
  return seasonEndDate();
}
