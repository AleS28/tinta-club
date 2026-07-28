import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";

export type LegalDocId = "terminos-lectores" | "acuerdo-autores";

interface LegalDocHeaderProps {
  activeDoc: LegalDocId;
  title: string;
  subtitle: string;
}

const docLinks: { id: LegalDocId; href: string; label: string }[] = [
  { id: "terminos-lectores", href: "/terminos-lectores", label: "Términos para Lectores" },
  { id: "acuerdo-autores", href: "/acuerdo-autores", label: "Acuerdo de Autores" },
];

export function LegalDocHeader({ activeDoc, title, subtitle }: LegalDocHeaderProps) {
  return (
    <header className="no-print border-b border-stone-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="inline-flex items-center gap-3 transition-opacity hover:opacity-80">
            <BrandLogo size="sm" />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-muted transition-colors hover:text-[#D27C5A] sm:self-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>

        <nav
          className="mt-5 flex flex-wrap gap-2 rounded-full border border-stone-200 bg-[#FCF9F5] p-1"
          aria-label="Documentos legales"
        >
          {docLinks.map((doc) => (
            <Link
              key={doc.id}
              href={doc.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeDoc === doc.id
                  ? "bg-[#D27C5A] text-white shadow-sm"
                  : "text-[#2A1810]/70 hover:bg-white hover:text-[#2A1810]"
              }`}
            >
              {doc.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6">
          <span className="inline-flex rounded-full border border-[#D4A359]/40 bg-[#D4A359]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#8B6914]">
            v1.0 — Julio 2026
          </span>
          <h1 className="mt-3 font-serif text-3xl font-bold text-[#D27C5A] sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}
