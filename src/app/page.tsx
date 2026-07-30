import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { TopObrasGrid } from "@/components/home/TopObrasGrid";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { LatestNewsSection } from "@/components/home/LatestNewsSection";
import { buildBookMetaMap } from "@/lib/book-meta";
import { getBooks } from "@/lib/db";

export default async function HomePage() {
  const books = await getBooks();
  const metaByBookId = buildBookMetaMap(books);

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main>
        <TopObrasGrid books={books} metaByBookId={metaByBookId} />

        <div className="relative bg-home-cream">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "url('/textures/literary-pattern.png')",
              backgroundSize: "400px auto",
              backgroundRepeat: "repeat",
            }}
            aria-hidden
          />
          <div className="relative">
            <CategoryGrid />
            <LatestNewsSection books={books} metaByBookId={metaByBookId} />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
