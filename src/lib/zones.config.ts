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
  /** Côtés symétriques affichant le même logo (gauche + droite). */
  anchors: {
    left: ZoneAnchor;
    right: ZoneAnchor;
  };
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

export const ZONES: ZoneConfig[] = [
  {
    key: "epaules",
    label: "Épaules",
    shortLabel: "Épaules",
    order: 0,
    basePriceCents: 15000,
    anchors: {
      left: { position: [-0.26, 0.56, 0.05], normal: [-0.6, 0.4, 0.7], size: [0.16, 0.16] },
      right: { position: [0.26, 0.56, 0.05], normal: [0.6, 0.4, 0.7], size: [0.16, 0.16] },
    },
  },
  {
    key: "biceps",
    label: "Biceps",
    shortLabel: "Biceps",
    order: 1,
    basePriceCents: 10000,
    anchors: {
      left: { position: [-0.31, 0.42, 0.06], normal: [-0.85, 0, 0.55], size: [0.14, 0.12] },
      right: { position: [0.31, 0.42, 0.06], normal: [0.85, 0, 0.55], size: [0.14, 0.12] },
    },
  },
  {
    key: "avant_bras",
    label: "Avant-bras",
    shortLabel: "Avant-bras",
    order: 2,
    basePriceCents: 8000,
    anchors: {
      left: { position: [-0.33, 0.16, 0.08], normal: [-0.75, 0, 0.66], size: [0.13, 0.14] },
      right: { position: [0.33, 0.16, 0.08], normal: [0.75, 0, 0.66], size: [0.13, 0.14] },
    },
  },
  {
    key: "omoplates",
    label: "Omoplates",
    shortLabel: "Omoplates",
    order: 3,
    basePriceCents: 12000,
    anchors: {
      left: { position: [-0.13, 0.48, -0.15], normal: [-0.35, 0.1, -0.94], size: [0.15, 0.15] },
      right: { position: [0.13, 0.48, -0.15], normal: [0.35, 0.1, -0.94], size: [0.15, 0.15] },
    },
  },
  {
    key: "cuisses",
    label: "Cuisses",
    shortLabel: "Cuisses",
    order: 4,
    basePriceCents: 18000,
    anchors: {
      left: { position: [-0.13, -0.42, 0.1], normal: [-0.55, 0, 0.83], size: [0.18, 0.2] },
      right: { position: [0.13, -0.42, 0.1], normal: [0.55, 0, 0.83], size: [0.18, 0.2] },
    },
  },
  {
    key: "mollets",
    label: "Mollets",
    shortLabel: "Mollets",
    order: 5,
    basePriceCents: 9000,
    anchors: {
      left: { position: [-0.12, -0.72, -0.08], normal: [-0.4, 0, -0.92], size: [0.13, 0.16] },
      right: { position: [0.12, -0.72, -0.08], normal: [0.4, 0, -0.92], size: [0.13, 0.16] },
    },
  },
];

export function getZoneConfig(key: string): ZoneConfig | undefined {
  return ZONES.find((z) => z.key === key);
}

export function defaultDeadline(): Date {
  return seasonEndDate();
}
