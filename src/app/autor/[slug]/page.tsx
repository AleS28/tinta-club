import { notFound } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AuthorPublicHero } from "@/components/autor-public/AuthorPublicHero";
import { AuthorFeaturedBook } from "@/components/autor-public/AuthorFeaturedBook";
import { AuthorUpcomingWorks } from "@/components/autor-public/AuthorUpcomingWorks";
import { getAuthorProfileBySlug, getAllAuthorSlugs } from "@/data/author-profiles";
import { BRAND_NAME } from "@/lib/brand";

interface AuthorPublicPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllAuthorSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: AuthorPublicPageProps) {
  const { slug } = await params;
  const profile = getAuthorProfileBySlug(slug);

  if (!profile) return { title: "Autor no encontrado" };

  return {
    title: `${profile.name} — Autor | ${BRAND_NAME}`,
    description: profile.bio,
  };
}

export default async function AuthorPublicPage({ params }: AuthorPublicPageProps) {
  const { slug } = await params;
  const profile = getAuthorProfileBySlug(slug);

  if (!profile) notFound();

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="min-h-screen bg-[#FCF9F5]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <AuthorPublicHero profile={profile} />
          <AuthorFeaturedBook work={profile.featuredWork} />
          <AuthorUpcomingWorks works={profile.upcomingWorks} />
        </div>
      </main>

      <Footer />
    </>
  );
}
