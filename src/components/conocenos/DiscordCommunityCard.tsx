import { MessageCircle } from "lucide-react";
import { DISCORD_INVITE_URL, isDiscordConfigured } from "@/lib/discord";
import { DiscordIcon } from "@/components/ui/DiscordIcon";

export function DiscordCommunityCard() {
  return (
    <section className="mt-12 overflow-hidden rounded-2xl border border-[#5865F2]/20 bg-gradient-to-br from-[#5865F2]/10 via-white to-terracotta/5 p-8 shadow-editorial sm:p-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/30">
          <DiscordIcon className="h-8 w-8 fill-current" />
        </div>

        <h2 className="mt-6 font-serif text-2xl font-bold text-ink sm:text-3xl">
          ¿Quieres hablar directamente con los fundadores y autores?
        </h2>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Únete a nuestro Discord oficial. Comparte ideas, conoce a otros lectores y descubre
          el detrás de cámaras de El Imperio de la Tinta.
        </p>

        {isDiscordConfigured() ? (
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-[#5865F2] px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300 hover:scale-105 hover:bg-[#4752C4] hover:shadow-lg hover:shadow-[#5865F2]/30"
          >
            <DiscordIcon className="h-5 w-5 fill-current" />
            Únete a nuestro Discord
          </a>
        ) : (
          <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-sidebar bg-white/70 px-5 py-3 text-sm text-muted">
            <MessageCircle className="h-4 w-4" />
            El enlace de Discord estará disponible muy pronto.
          </p>
        )}
      </div>
    </section>
  );
}
