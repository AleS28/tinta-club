import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { StoreCatalogPublic } from "@/components/tienda/StoreCatalog";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Tienda — ${BRAND_NAME}`,
  description: "Compra libros y capítulos premium. Lectura digital de por vida en el visor de El Imperio de la Tinta.",
};

export default function TiendaPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <StoreCatalogPublic />
      <Footer />
    </>
  );
}
