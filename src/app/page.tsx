import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PlatformCoffeeCTA } from "@/components/home/PlatformCoffeeCTA";
import { HomePrimaryCTA } from "@/components/home/HomePrimaryCTA";
import { StartHereSection } from "@/components/home/StartHereSection";
import { HomeAuthorsSpotlight } from "@/components/home/HomeAuthorsSpotlight";
import { ImperialHeroCarousel } from "@/components/home/imperial/ImperialHeroCarousel";
import { HomeGenrePills } from "@/components/home/imperial/HomeGenrePills";
import { HomeImperialCatalog } from "@/components/home/imperial/HomeImperialCatalog";
import { HomeSidebar } from "@/components/home/imperial/HomeSidebar";
import { HomeJoinBanner } from "@/components/home/imperial/HomeJoinBanner";
import { buildBookMetaMap } from "@/lib/book-meta";
import { getBooks } from "@/lib/db";

export default async function HomePage() {
  const books = await getBooks();
  const metaByBookId = buildBookMetaMap(books);

  return (
    <div className="min-h-screen bg-imperial-canvas">
      <AnnouncementBar />
      <Navbar />

      <main>
        <ImperialHeroCarousel />
        <HomeGenrePills />

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-10">
              <HomeImperialCatalog books={books} metaByBookId={metaByBookId} />

              <section className="rounded-2xl border border-imperial-gold/15 bg-imperial-surface/40 p-4 sm:p-5">
                <div className="grid gap-4 lg:grid-cols-2">
                  <HomePrimaryCTA />
                  <PlatformCoffeeCTA />
                </div>
              </section>

              <StartHereSection variant="imperial" />
              <HomeAuthorsSpotlight variant="imperial" />
            </div>

            <HomeSidebar books={books} />
          </div>
        </div>

        <HomeJoinBanner />
      </main>

      <Footer />
    </div>
  );
}
