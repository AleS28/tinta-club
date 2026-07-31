import { Suspense } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { LibraryPanel } from "@/components/biblioteca/LibraryPanel";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Mi Biblioteca — ${BRAND_NAME}`,
  description: `Suscripción, compras, favoritos y autores que sigues en ${BRAND_NAME}.`,
};

export default function BibliotecaPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <Suspense fallback={<p className="py-12 text-center text-sm text-muted">Cargando biblioteca…</p>}>
        <LibraryPanel />
      </Suspense>
      <Footer />
    </>
  );
}
