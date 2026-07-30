import { Tag } from "lucide-react";
import { homeCategories } from "@/data/home-categories";
import { CategoryButton } from "@/components/home/CategoryButton";

export function CategoryGrid() {
  return (
    <section className="px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-3">
          <Tag className="h-6 w-6 text-home-terracotta" aria-hidden />
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-[#2A1D17] sm:text-2xl">
            Explorar por Categoría
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {homeCategories.map((category) => (
            <CategoryButton key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
