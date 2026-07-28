import { Footer } from "@/components/layout/Footer";
import { LegalDocHeader, type LegalDocId } from "@/components/legal/LegalDocHeader";
import { LegalPrintButton } from "@/components/legal/LegalPrintButton";

interface LegalDocLayoutProps {
  activeDoc: LegalDocId;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function LegalDocLayout({ activeDoc, title, subtitle, children }: LegalDocLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FCF9F5] print:bg-white">
      <LegalDocHeader activeDoc={activeDoc} title={title} subtitle={subtitle} />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10 print:border-none print:shadow-none">
          <div className="legal-prose">{children}</div>

          <div className="not-prose mt-10 flex flex-col items-center gap-3 border-t border-stone-200 pt-8 print:hidden">
            <LegalPrintButton />
            <p className="text-center text-xs text-muted">
              Usa la opción «Guardar como PDF» en el diálogo de impresión de tu navegador.
            </p>
          </div>
        </article>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
