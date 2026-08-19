import Link from "next/link";
import { homeCategories } from "@/data/home-categories";

const FEATURED_SLUGS = [
  "ciencia-ficcion",
  "drama",
  "romance",
  "terror",
  "fantasia",
  "misterio",
] as const;

export function HomeGenrePills() {
  const pills = homeCategories.filter((c) =>
    FEATURED_SLUGS.includes(c.slug as typeof FEATURED_SLUGS[number]),
  );

  return (
    <section className="px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {pills.map((category) => (
            <Link
              key={category.id}
              href={`/buscar?categoria=${category.slug}`}
              className="rounded-full border border-imperial-gold/35 bg-imperial-surface/80 px-4 py-2 text-xs font-semibold text-gold-cream/90 transition-all hover:border-imperial-gold/60 hover:bg-imperial-gold/10 hover:text-imperial-gold sm:text-sm"
            >
              {category.label}
            </Link>
          ))}
          <Link
            href="/buscar"
            className="rounded-full border border-imperial-gold/50 bg-imperial-gold/15 px-4 py-2 text-xs font-bold text-imperial-gold transition-all hover:bg-imperial-gold/25 sm:text-sm"
          >
            Ver todo
          </Link>
        </div>
      </div>
    </section>
  );
}
