import { Suspense } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SearchExplorer } from "@/components/search/SearchExplorer";
import { BRAND_NAME } from "@/lib/brand";
import { getBooks } from "@/lib/db";

export const metadata = {
  title: `Buscar — ${BRAND_NAME}`,
  description: "Encuentra obras y autores en El Imperio de la Tinta.",
};

export default async function BuscarPage() {
  const books = await getBooks();

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <Suspense fallback={<p className="py-12 text-center text-sm text-muted">Cargando catálogo…</p>}>
        <SearchExplorer books={books} />
      </Suspense>
      <Footer />
    </>
  );
}
