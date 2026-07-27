import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { LibraryPanel } from "@/components/biblioteca/LibraryPanel";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Mi Biblioteca — ${BRAND_NAME}`,
  description: `Tus libros guardados y autores que sigues en ${BRAND_NAME}.`,
};

export default function BibliotecaPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <LibraryPanel />
      <Footer />
    </>
  );
}
