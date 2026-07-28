import { Headphones } from "lucide-react";
import { DISCORD_INVITE_URL, isDiscordConfigured } from "@/lib/discord";
import { DiscordIcon } from "@/components/ui/DiscordIcon";

export function AuthorDiscordBanner() {
  if (!isDiscordConfigured()) return null;

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-[#5865F2]/25 bg-gradient-to-r from-[#5865F2]/15 via-imperial-dark to-imperial-deep p-6 shadow-editorial-lg sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#5865F2] text-white">
            <Headphones className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold/80">
              Canal exclusivo de autores
            </p>
            <h2 className="mt-1 font-serif text-xl font-bold text-gold-cream sm:text-2xl">
              Contacto Directo &amp; Soporte de Autores
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
              Entra al canal exclusivo de Discord para coordinar tus lanzamientos e historias con
              el equipo del Imperio.
            </p>
          </div>
        </div>

        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#5865F2] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-[#4752C4]"
        >
          <DiscordIcon className="h-5 w-5 fill-current" />
          Entrar al Discord
        </a>
      </div>
    </section>
  );
}
