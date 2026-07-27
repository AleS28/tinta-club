import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AuthorPanel } from "@/components/autor/AuthorPanel";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Panel del Autor — ${BRAND_NAME}`,
  description: `Publica y gestiona tus obras en ${BRAND_NAME}.`,
};

export default function AutorPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <AuthorPanel />
      <Footer />
    </>
  );
}
