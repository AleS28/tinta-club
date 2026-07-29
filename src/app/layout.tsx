import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { SiteShell } from "@/components/layout/SiteShell";
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

export const metadata: Metadata = {
  title: "El Imperio de la Tinta — Plataforma de Narrativa Independiente",
  description:
    "Lee historias únicas y apoya a autores independientes. Plataforma de lectura por suscripción para narrativa en español.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${merriweather.variable} font-sans`}>
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
