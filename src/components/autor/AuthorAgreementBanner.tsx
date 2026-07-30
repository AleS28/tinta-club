"use client";

import Link from "next/link";
import { FileSignature, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { hasAuthorAgreementSigned } from "@/types/user";

export function AuthorAgreementBanner() {
  const { userProfile } = useAuth();
  const signed = hasAuthorAgreementSigned(userProfile);

  if (signed) {
    return (
      <section className="mb-8 overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/80 p-6 shadow-editorial sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Acuerdo de autor activo
            </p>
            <h2 className="mt-1 font-serif text-xl font-bold text-[#2A1810] sm:text-2xl">
              Puedes publicar capítulos premium
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Tu firma digital cubre todas las obras de esta cuenta. Consulta tu certificado cuando
              lo necesites.
            </p>
            <Link
              href="/autor/acuerdo"
              className="mt-4 inline-flex text-sm font-semibold text-[#D27C5A] hover:underline"
            >
              Ver certificado de firma
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-[#D4A359]/30 bg-gradient-to-r from-[#FCF9F5] via-white to-[#D4A359]/10 p-6 shadow-editorial sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D27C5A]/15 text-[#D27C5A]">
            <FileSignature className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6914]">
              Acuerdo 70/30 · Requerido para premium
            </p>
            <h2 className="mt-1 font-serif text-xl font-bold text-[#2A1810] sm:text-2xl">
              Firma tu Acuerdo de Publicación
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Debes firmar el acuerdo de publicación antes de publicar cualquier obra o capítulo.
              Es un trámite único por cuenta de autor.
            </p>
          </div>
        </div>

        <Link
          href="/autor/acuerdo"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#D27C5A] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-[#c06a48]"
        >
          Firmar acuerdo
        </Link>
      </div>
    </section>
  );
}
