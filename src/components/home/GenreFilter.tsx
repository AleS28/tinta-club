"use client";

import { useState } from "react";
import { Ghost, Heart, Rocket, Sparkles } from "lucide-react";
import { Genre, genres } from "@/data/mock";

const iconMap = {
  heart: Heart,
  sparkles: Sparkles,
  ghost: Ghost,
  rocket: Rocket,
};

export function GenreFilter() {
  const [active, setActive] = useState<Genre | null>(null);

  return (
    <section>
      <h2 className="font-serif text-xl font-bold text-ink">Géneros</h2>
      <div className="mt-4 flex flex-wrap gap-4">
        {genres.map((genre) => {
          const Icon = iconMap[genre.icon as keyof typeof iconMap];
          const isActive = active === genre.id;

          return (
            <button
              key={genre.id}
              onClick={() => setActive(isActive ? null : genre.id)}
              className={`flex flex-col items-center gap-2 transition-transform hover:scale-105`}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full transition-all ${genre.color} ${
                  isActive ? "ring-2 ring-terracotta ring-offset-2" : ""
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-ink">{genre.id}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
