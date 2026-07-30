import Link from "next/link";
import type { HomeCategory } from "@/data/home-categories";

interface CategoryButtonProps {
  category: HomeCategory;
}

export function CategoryButton({ category }: CategoryButtonProps) {
  const LeftIcon = category.leftIcon;
  const RightIcon = category.rightIcon;

  return (
    <Link
      href={`/biblioteca?categoria=${category.slug}`}
      className="group relative flex min-h-[88px] items-center justify-center overflow-hidden rounded-xl border border-[#8B6914]/25 bg-parchment-texture px-4 py-5 shadow-editorial transition-all duration-300 hover:-translate-y-0.5 hover:border-home-gold/50 hover:shadow-editorial-lg"
    >
      <LeftIcon
        className="absolute left-3 top-1/2 h-8 w-8 -translate-y-1/2 text-[#8B6914]/20 transition-colors group-hover:text-[#8B6914]/35 sm:left-4 sm:h-10 sm:w-10"
        strokeWidth={1.25}
        aria-hidden
      />
      <RightIcon
        className="absolute right-3 top-1/2 h-8 w-8 -translate-y-1/2 text-[#8B6914]/20 transition-colors group-hover:text-[#8B6914]/35 sm:right-4 sm:h-10 sm:w-10"
        strokeWidth={1.25}
        aria-hidden
      />

      <span className="relative z-10 px-8 text-center font-display text-sm font-bold uppercase tracking-wide text-[#2A1D17] sm:text-base">
        {category.label}
      </span>
    </Link>
  );
}
