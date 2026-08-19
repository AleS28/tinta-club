import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PlatformCoffeeCTA } from "@/components/home/PlatformCoffeeCTA";
import { HomePrimaryCTA } from "@/components/home/HomePrimaryCTA";
import { HomeWelcomeHero } from "@/components/home/HomeWelcomeHero";
import { CommunityLinksBar } from "@/components/home/CommunityLinksBar";
import { StartHereSection } from "@/components/home/StartHereSection";
import { HomeAuthorsSpotlight } from "@/components/home/HomeAuthorsSpotlight";
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
        <HomeWelcomeHero />
        <TopObrasGrid books={books} metaByBookId={metaByBookId} />

        <section className="bg-home-dark px-4 py-8 sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
            <HomePrimaryCTA />
            <PlatformCoffeeCTA />
          </div>
        </section>

        <CommunityLinksBar />

        <StartHereSection />

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
            <HomeAuthorsSpotlight />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
