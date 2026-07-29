import { Send } from "lucide-react";
import { TELEGRAM_INVITE_URL, isTelegramConfigured } from "@/lib/telegram";

export function TelegramCommunityCard() {
  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-[#229ED9]/20 bg-gradient-to-br from-[#229ED9]/10 via-white to-terracotta/5 p-8 shadow-editorial sm:p-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#229ED9] text-white shadow-lg shadow-[#229ED9]/30">
          <Send className="h-7 w-7" aria-hidden />
        </div>

        <h2 className="mt-6 font-serif text-2xl font-bold text-ink sm:text-3xl">
          Únete al canal oficial en Telegram
        </h2>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Novedades, avisos de capítulos y conversación con la comunidad del Imperio — directo en
          tu móvil.
        </p>

        {isTelegramConfigured() ? (
          <a
            href={TELEGRAM_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-[#229ED9] px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300 hover:scale-105 hover:bg-[#1d8bc4] hover:shadow-lg hover:shadow-[#229ED9]/30"
          >
            <Send className="h-5 w-5" aria-hidden />
            Unirme al canal
          </a>
        ) : (
          <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-sidebar bg-white/70 px-5 py-3 text-sm text-muted">
            El enlace de Telegram estará disponible muy pronto.
          </p>
        )}
      </div>
    </section>
  );
}
