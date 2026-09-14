export type SponsorInfo = {
  status: "pending_upload" | "active";
  sponsorName: string | null;
  sponsorUrl: string | null;
  logoUrl: string | null;
};

export type ZoneDTO = {
  key: string;
  label: string;
  shortLabel: string;
  order: number;
  currentPriceCents: number;
  basePriceCents: number;
  deadline: string; // ISO
  isClosed: boolean;
  sponsor: SponsorInfo | null;
};

export type ZonesResponse = {
  zones: ZoneDTO[];
  serverTime: string; // ISO — pour recaler les décomptes côté client
};

export type CheckoutResponse = { url: string } | { error: string };
