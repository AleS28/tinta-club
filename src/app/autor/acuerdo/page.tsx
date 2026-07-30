import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AuthorAgreementSignForm } from "@/components/legal/AuthorAgreementSignForm";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Acuerdo de Autor — ${BRAND_NAME}`,
  description:
    "Firma digital del Acuerdo General de Distribución y Monetización. Una sola firma por cuenta de autor para todas tus obras.",
};

export default function AutorAcuerdoPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="min-h-screen bg-[#FCF9F5]">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <header className="mb-8 text-center sm:text-left">
            <span className="inline-flex rounded-full border border-[#D4A359]/40 bg-[#D4A359]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#8B6914]">
              Acuerdo de cuenta · v1.0
            </span>
            <h1 className="mt-4 font-serif text-3xl font-bold text-[#D27C5A] sm:text-4xl">
              Acuerdo de Publicación para Autores
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted">
              Firma una sola vez para tu cuenta. Es obligatorio antes de publicar cualquier obra o
              capítulo en el modelo{" "}
              <strong className="font-semibold text-[#2A1810]">70% autor / 30% plataforma</strong>.
            </p>
            <p className="mt-2 text-sm text-muted">
              ¿Ya firmaste?{" "}
              <Link href="/autor" className="font-medium text-[#D27C5A] hover:underline">
                Ir al panel del autor
              </Link>
            </p>
          </header>

          <AuthGuard redirectTo="/autor/acuerdo" authModalRedirect="/autor/acuerdo">
            <AuthorAgreementSignForm />
          </AuthGuard>
        </div>
      </main>

      <Footer />
    </>
  );
}
