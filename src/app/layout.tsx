import type { Metadata } from "next";
import { Inter, Merriweather, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { SiteShell } from "@/components/layout/SiteShell";
import { isLaunchMode } from "@/lib/launch";
import { buildSiteOpenGraph } from "@/lib/metadata-og";
import { getAppUrl } from "@/lib/app-url";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "El Imperio de la Tinta — Plataforma de Narrativa Independiente",
  description: isLaunchMode()
    ? "Lee historias independientes en español gratis durante el lanzamiento. Romance, fantasía y más. Apoya con un café si quieres."
    : "Lee historias únicas y apoya a autores independientes. Plataforma de lectura por suscripción para narrativa en español.",
  metadataBase: new URL(getAppUrl()),
  openGraph: buildSiteOpenGraph(),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${merriweather.variable} ${playfair.variable} font-sans`}>
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
