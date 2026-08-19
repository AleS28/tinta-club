import Link from "next/link";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { CommunityLinksBar } from "@/components/home/CommunityLinksBar";

export function Footer({ variant = "default" }: { variant?: "default" | "imperial" }) {
  const isImperial = variant === "imperial";

  return (
    <footer
      className={`mt-8 border-t py-10 ${
        isImperial
          ? "border-imperial-gold/20 bg-imperial-canvas"
          : "mt-16 border-sidebar bg-paper"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <p
          className={`font-serif text-xl font-bold ${isImperial ? "text-imperial-gold" : "text-ink"}`}
        >
          {BRAND_NAME}
        </p>
        <p className={`mt-1 text-sm ${isImperial ? "text-gold-cream/65" : "text-muted"}`}>
          {BRAND_TAGLINE}
        </p>

        <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          <Link
            href="/conocenos"
            className={`transition-colors ${isImperial ? "text-gold-cream/70 hover:text-imperial-gold" : "text-muted hover:text-terracotta"}`}
          >
            Conócenos
          </Link>
          <Link
            href="/buscar"
            className={`transition-colors ${isImperial ? "text-gold-cream/70 hover:text-imperial-gold" : "text-muted hover:text-terracotta"}`}
          >
            Explorar obras
          </Link>
          <Link
            href="/terminos-lectores"
            className={`transition-colors ${isImperial ? "text-gold-cream/70 hover:text-imperial-gold" : "text-muted hover:text-terracotta"}`}
          >
            Términos para Lectores
          </Link>
          <Link
            href="/acuerdo-autores"
            className={`transition-colors ${isImperial ? "text-gold-cream/70 hover:text-imperial-gold" : "text-muted hover:text-terracotta"}`}
          >
            Acuerdo de Autores
          </Link>
        </nav>

        <div className="mt-6">
          <CommunityLinksBar variant="footer" />
        </div>

        <p className={`mt-6 text-xs ${isImperial ? "text-gold-cream/50" : "text-muted/80"}`}>
          © {new Date().getFullYear()} {BRAND_NAME}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
