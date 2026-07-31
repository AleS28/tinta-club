import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PurchasedLibraryPanel } from "@/components/mi-biblioteca/PurchasedLibraryPanel";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Mis compras — ${BRAND_NAME}`,
  description: "Tus libros y capítulos comprados. Acceso permanente al visor web.",
};

export default function MiBibliotecaPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <PurchasedLibraryPanel />
      <Footer />
    </>
  );
}
