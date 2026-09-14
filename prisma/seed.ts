import { PrismaClient } from "@prisma/client";
import { ZONES, defaultDeadline } from "../src/lib/zones.config";

const prisma = new PrismaClient();

async function main() {
  const deadline = defaultDeadline();

  for (const zone of ZONES) {
    await prisma.zone.upsert({
      where: { key: zone.key },
      update: {}, // ne touche jamais une zone déjà initialisée (prix/sponsor en cours)
      create: {
        key: zone.key,
        label: zone.label,
        order: zone.order,
        basePriceCents: zone.basePriceCents,
        currentPriceCents: zone.basePriceCents,
        deadline,
      },
    });
  }

  console.log(`Seed terminé — ${ZONES.length} zones vérifiées/créées.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
