"use client";

export type CategoryFilter = "Todas" | "Romance" | "Fantasía" | "Suspenso" | "Poesía";

const categories: CategoryFilter[] = ["Todas", "Romance", "Fantasía", "Suspenso", "Poesía"];

interface GenreFilterProps {
  active: CategoryFilter;
  onChange: (category: CategoryFilter) => void;
}

export function GenreFilter({ active, onChange }: GenreFilterProps) {
  return (
    <section>
      <h2 className="font-serif text-xl font-bold text-ink">Explorar por Categoría</h2>
      <p className="mt-1 text-sm text-muted">Encuentra tu próxima lectura favorita</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = active === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                isActive
                  ? "border-imperial-deep bg-imperial-deep text-gold-cream shadow-md shadow-imperial-deep/20"
                  : "border-amber-900/15 bg-white text-ink shadow-sm hover:border-gold/50 hover:bg-gold-cream/30 hover:shadow-md"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function matchesCategoryFilter(
  genre: string,
  filter: CategoryFilter,
): boolean {
  if (filter === "Todas") return true;
  if (filter === "Suspenso") return genre === "Terror";
  if (filter === "Poesía") return genre === "Poesía";
  return genre === filter;
}
