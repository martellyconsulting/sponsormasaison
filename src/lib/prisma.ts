import { PrismaClient } from "@prisma/client";

// Singleton Prisma — évite d'ouvrir une nouvelle connexion à chaque hot-reload
// en développement (pattern recommandé par Prisma pour Next.js).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Le pooler de connexion Supabase (pgbouncer, port 6543) est incompatible
 * avec les "prepared statements" que Prisma utilise par défaut, ce qui
 * provoque des erreurs aléatoires `prepared statement "sXX" already exists`
 * en production. Le correctif standard est d'ajouter `pgbouncer=true` (et
 * `connection_limit=1`, recommandé en environnement serverless) à l'URL de
 * connexion — on le fait ici automatiquement plutôt que de dépendre d'un
 * paramètre ajouté à la main dans les variables d'environnement, qui est
 * facile à perdre en modifiant l'URL par la suite.
 */
function withPoolerSafeParams(databaseUrl: string): string {
  try {
    const url = new URL(databaseUrl);
    const isSupabasePooler = url.hostname.includes("pooler.supabase.com") || url.port === "6543";
    if (isSupabasePooler) {
      if (!url.searchParams.has("pgbouncer")) url.searchParams.set("pgbouncer", "true");
      if (!url.searchParams.has("connection_limit")) url.searchParams.set("connection_limit", "1");
    }
    return url.toString();
  } catch {
    // URL malformée : on laisse Prisma remonter une erreur claire plutôt
    // que de faire échouer la construction du client ici.
    return databaseUrl;
  }
}

function createPrismaClient(): PrismaClient {
  const rawUrl = process.env.DATABASE_URL;
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    ...(rawUrl ? { datasources: { db: { url: withPoolerSafeParams(rawUrl) } } } : {}),
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
