"use client";

import { useState } from "react";
import { ChevronDown, Tag } from "lucide-react";
import { homeCategories } from "@/data/home-categories";
import { CategoryButton } from "@/components/home/CategoryButton";

export function CategoryGrid() {
  const [open, setOpen] = useState(false);

  return (
    <section className="px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-center gap-3">
          <Tag className="h-6 w-6 text-home-terracotta" aria-hidden />
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-[#2A1D17] sm:text-2xl">
            Explorar por Categoría
          </h2>
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="home-genres-panel"
          onClick={() => setOpen((prev) => !prev)}
          className="group relative flex w-full items-center justify-center rounded-2xl border border-[#8B6914]/30 bg-parchment-texture px-6 py-5 shadow-editorial transition-all duration-300 hover:border-home-gold/50 hover:shadow-editorial-lg sm:px-8 sm:py-6"
        >
          <span className="font-display text-xl font-bold uppercase tracking-[0.2em] text-[#2A1D17] sm:text-2xl">
            Géneros
          </span>
          <ChevronDown
            className={`absolute right-6 h-6 w-6 shrink-0 text-home-gold transition-transform duration-300 sm:right-8 ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>

        {open && (
          <div
            id="home-genres-panel"
            className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
          >
            {homeCategories.map((category) => (
              <CategoryButton key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
