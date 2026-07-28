import Link from "next/link";
import { FileSignature } from "lucide-react";

export function AuthorAgreementBanner() {
  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-[#D4A359]/30 bg-gradient-to-r from-[#FCF9F5] via-white to-[#D4A359]/10 p-6 shadow-editorial sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D27C5A]/15 text-[#D27C5A]">
            <FileSignature className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6914]">
              Acuerdo 70/30
            </p>
            <h2 className="mt-1 font-serif text-xl font-bold text-[#2A1810] sm:text-2xl">
              Firma tu Acuerdo de Publicación
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Antes de publicar capítulos premium, completa tu firma digital y obtén tu certificado
              de autor registrado.
            </p>
          </div>
        </div>

        <Link
          href="/firmar-acuerdo-autor"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#D27C5A] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-[#c06a48]"
        >
          Firmar acuerdo
        </Link>
      </div>
    </section>
  );
}
