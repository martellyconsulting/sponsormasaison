import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const ALLOWED_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
] as const;

export const MAX_LOGO_BYTES = 4 * 1024 * 1024; // 4 Mo

function extensionFor(contentType: string): string {
  switch (contentType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/svg+xml":
      return "svg";
    default:
      return "bin";
  }
}

/**
 * Stocke le logo d'un sponsor et renvoie son URL publique.
 *
 * En production (Vercel), utilise Vercel Blob (`BLOB_READ_WRITE_TOKEN`).
 * En développement local sans token Blob configuré, on écrit simplement le
 * fichier dans `public/uploads/` pour ne pas bloquer le dev — cette solution
 * de repli ne fonctionne pas sur un hébergement serverless en production.
 */
export async function storeLogo(file: File, zoneKey: string): Promise<string> {
  const ext = extensionFor(file.type);
  const filename = `logos/${zoneKey}-${randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });
    return blob.url;
  }

  // Repli développement local
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const localName = `${zoneKey}-${randomUUID()}.${ext}`;
  await writeFile(path.join(uploadsDir, localName), buffer);
  console.warn(
    "[blob] BLOB_READ_WRITE_TOKEN absent — logo enregistré localement dans public/uploads/. " +
      "Configure Vercel Blob avant la mise en production.",
  );
  return `/uploads/${localName}`;
}
