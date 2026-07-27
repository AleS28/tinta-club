import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { GenreFilter } from "@/components/home/GenreFilter";
import { BookGrid } from "@/components/home/BookGrid";
import { TopAuthors } from "@/components/home/TopAuthors";
import { SubscriptionCTA } from "@/components/home/SubscriptionCTA";
import { topAuthors } from "@/data/mock";
import { getBooks } from "@/lib/db";

export default async function HomePage() {
  const books = await getBooks();

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            <FeaturedCarousel />
            <GenreFilter />
            <BookGrid books={books} />
          </div>

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
