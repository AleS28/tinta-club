import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { AuthorPanel } from "@/components/autor/AuthorPanel";

export const metadata = {
  title: "Panel del Autor — Tinta Club",
  description: "Publica y gestiona tus obras en Tinta Club.",
};

export default function AutorPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <AuthorPanel />
    </>
  );
}
