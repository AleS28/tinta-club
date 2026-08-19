import Link from "next/link";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { CommunityLinksBar } from "@/components/home/CommunityLinksBar";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-sidebar bg-paper py-10">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <p className="font-serif text-xl font-bold text-ink">{BRAND_NAME}</p>
        <p className="mt-1 text-sm text-muted">{BRAND_TAGLINE}</p>

        <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          <Link href="/conocenos" className="text-muted transition-colors hover:text-terracotta">
            Conócenos
          </Link>
          <Link href="/buscar" className="text-muted transition-colors hover:text-terracotta">
            Explorar obras
          </Link>
          <Link href="/terminos-lectores" className="text-muted transition-colors hover:text-terracotta">
            Términos para Lectores
          </Link>
          <Link href="/acuerdo-autores" className="text-muted transition-colors hover:text-terracotta">
            Acuerdo de Autores
          </Link>
        </nav>

        <div className="mt-6">
          <CommunityLinksBar variant="footer" />
        </div>

        <p className="mt-6 text-xs text-muted/80">
          © {new Date().getFullYear()} {BRAND_NAME}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
