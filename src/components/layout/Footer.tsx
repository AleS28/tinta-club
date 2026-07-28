import Link from "next/link";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { isDiscordConfigured } from "@/lib/discord";
import { DiscordInviteLink } from "@/components/discord/DiscordInviteLink";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-sidebar bg-paper py-10">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <p className="font-serif text-xl font-bold text-ink">{BRAND_NAME}</p>
        <p className="mt-1 text-sm text-muted">{BRAND_TAGLINE}</p>

        <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          <Link href="/terminos-lectores" className="text-muted transition-colors hover:text-terracotta">
            Términos para Lectores
          </Link>
          <Link href="/acuerdo-autores" className="text-muted transition-colors hover:text-terracotta">
            Acuerdo de Autores
          </Link>
        </nav>

        {isDiscordConfigured() && (
          <DiscordInviteLink
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#5865F2]/25 bg-[#5865F2]/5 px-5 py-2.5 text-sm font-medium text-[#4752C4] transition-all duration-300 hover:border-[#5865F2]/40 hover:bg-[#5865F2]/10 hover:text-[#5865F2]"
          >
            Únete a nuestra comunidad en Discord
          </DiscordInviteLink>
        )}

        <p className="mt-4 text-xs text-muted/80">
          © {new Date().getFullYear()} {BRAND_NAME}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
