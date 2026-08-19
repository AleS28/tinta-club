import { Crown } from "lucide-react";
import { topAuthors } from "@/data/mock";
import { getAuthorProfileBySlug } from "@/data/author-profiles";
import { HomeAuthorCard } from "@/components/home/HomeAuthorCard";

export function HomeAuthorsSpotlight({ variant = "default" }: { variant?: "default" | "imperial" }) {
  const isImperial = variant === "imperial";

  return (
    <section className={isImperial ? "" : "px-4 py-8 sm:px-6 sm:py-10"}>
      <div className={isImperial ? "" : "mx-auto max-w-7xl"}>
        <div className="mb-5 flex items-center gap-2">
          <Crown className={`h-5 w-5 ${isImperial ? "text-imperial-gold" : "text-gold"}`} />
          <h2
            className={`font-serif text-xl font-bold ${isImperial ? "text-imperial-gold" : "text-ink"}`}
          >
            Autores del Imperio
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topAuthors.map((author) => {
            const profile = author.slug ? getAuthorProfileBySlug(author.slug) : undefined;
            return (
              <HomeAuthorCard
                key={author.id}
                variant={variant}
                authorId={author.id}
                name={profile?.name ?? author.name}
                bio={profile?.bio}
                photoUrl={profile?.photoUrl}
                slug={author.slug}
                bookCount={author.bookCount}
                initials={author.initials}
                avatarColor={author.avatarColor}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
