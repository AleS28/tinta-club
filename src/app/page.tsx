import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { FeaturedHero } from "@/components/home/FeaturedHero";
import { HomeCatalog } from "@/components/home/HomeCatalog";
import { TopAuthors } from "@/components/home/TopAuthors";
import { SubscriptionCTA } from "@/components/home/SubscriptionCTA";
import { featuredBook, topAuthors } from "@/data/mock";
import { buildBookMetaMap, getBookMeta } from "@/lib/book-meta";
import { getBooks } from "@/lib/db";

export default async function HomePage() {
  const books = await getBooks();
  const metaByBookId = buildBookMetaMap(books);
  const featuredMeta = getBookMeta(featuredBook.id, featuredBook.synopsis);

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <FeaturedHero book={featuredBook} meta={featuredMeta} />

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <HomeCatalog
            books={books}
            metaByBookId={metaByBookId}
            excludeBookId={featuredBook.id}
          />

          <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <TopAuthors authors={topAuthors} />
            <SubscriptionCTA />
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
