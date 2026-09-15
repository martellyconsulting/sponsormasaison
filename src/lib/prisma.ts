import { PrismaClient } from "@prisma/client";

// Singleton Prisma — évite d'ouvrir une nouvelle connexion à chaque hot-reload
// en développement (pattern recommandé par Prisma pour Next.js).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

/**
 * Le client Prisma n'est construit qu'au premier accès réel (via ce Proxy),
 * jamais à l'import du module. `new PrismaClient()` lit `DATABASE_URL`
 * immédiatement et lève une erreur si elle est absente — or Next.js importe
 * chaque route API pendant l'étape de build "collect page data", y compris
 * quand la variable n'est pas encore exposée à ce stade. Sans ce délai, une
 * variable d'environnement mal configurée ferait planter tout le build au
 * lieu d'une simple erreur 500 sur la route concernée à l'exécution.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = globalForPrisma.prisma ?? createPrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
    }
    return Reflect.get(client as object, prop, receiver);
  },
});
