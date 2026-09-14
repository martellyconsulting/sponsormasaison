import { PrismaClient } from "@prisma/client";

// Singleton Prisma — évite d'ouvrir une nouvelle connexion à chaque hot-reload
// en développement (pattern recommandé par Prisma pour Next.js).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
