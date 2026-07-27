import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { LibraryPanel } from "@/components/biblioteca/LibraryPanel";

export const metadata = {
  title: "Mi Biblioteca — Tinta Club",
  description: "Tus libros guardados y autores que sigues en Tinta Club.",
};

export default function BibliotecaPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <LibraryPanel />
    </>
  );
}
