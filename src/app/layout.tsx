import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Sponsorise ma saison — Sponsoring corporel athlète",
  description:
    "Sponsorise une zone du corps de l'athlète pour la saison Hyrox Solo Pro, Hyrox Duo et Marathon. Ton logo affiché en direct sur son avatar 3D.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body className="bg-arena-bg text-white font-body antialiased">{children}</body>
    </html>
  );
}
