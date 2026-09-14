import type { Zone, Sponsorship } from "@prisma/client";
import type { ZoneDTO } from "@/types/zone";
import { getZoneConfig } from "./zones.config";

export function toZoneDTO(zone: Zone, sponsorship: Sponsorship | null): ZoneDTO {
  const config = getZoneConfig(zone.key);
  return {
    key: zone.key,
    label: zone.label,
    shortLabel: config?.shortLabel ?? zone.label,
    order: zone.order,
    currentPriceCents: zone.currentPriceCents,
    basePriceCents: zone.basePriceCents,
    deadline: zone.deadline.toISOString(),
    isClosed: zone.deadline.getTime() <= Date.now(),
    sponsor:
      sponsorship && (sponsorship.status === "active" || sponsorship.status === "pending_upload")
        ? {
            status: sponsorship.status as "active" | "pending_upload",
            sponsorName: sponsorship.sponsorName,
            sponsorUrl: sponsorship.sponsorUrl,
            logoUrl: sponsorship.logoUrl,
          }
        : null,
  };
}
