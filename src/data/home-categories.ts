import type { LucideIcon } from "lucide-react";
import {
  Compass,
  Flame,
  Ghost,
  Globe,
  Heart,
  KeyRound,
  Landmark,
  Mountain,
  Rocket,
  Scroll,
  Sparkles,
  Theater,
  Wand2,
} from "lucide-react";
import type { Book } from "@/data/mock";

export interface HomeCategory {
  id: string;
  label: string;
  slug: string;
  leftIcon: LucideIcon;
  rightIcon: LucideIcon;
}

export const homeCategories: HomeCategory[] = [
  {
    id: "romance",
    label: "Romance",
    slug: "romance",
    leftIcon: Heart,
    rightIcon: Heart,
  },
  {
    id: "misterio",
    label: "Misterio y Suspenso",
    slug: "misterio",
    leftIcon: Flame,
    rightIcon: KeyRound,
  },
  {
    id: "aventura",
    label: "Aventura Épica",
    slug: "aventura",
    leftIcon: Compass,
    rightIcon: Mountain,
  },
  {
    id: "ciencia-ficcion",
    label: "Ciencia Ficción",
    slug: "ciencia-ficcion",
    leftIcon: Rocket,
    rightIcon: Globe,
  },
  {
    id: "fantasia",
    label: "Fantasía",
    slug: "fantasia",
    leftIcon: Sparkles,
    rightIcon: Wand2,
  },
  {
    id: "terror",
    label: "Terror",
    slug: "terror",
    leftIcon: Ghost,
    rightIcon: Ghost,
  },
  {
    id: "drama",
    label: "Drama",
    slug: "drama",
    leftIcon: Theater,
    rightIcon: Theater,
  },
  {
    id: "historico",
    label: "Histórico",
    slug: "historico",
    leftIcon: Scroll,
    rightIcon: Landmark,
  },
];

export function getHomeCategoryBySlug(slug: string): HomeCategory | undefined {
  return homeCategories.find((category) => category.slug === slug);
}

export function matchesHomeCategory(book: Book, slug: string): boolean {
  const normalized = slug.trim().toLowerCase();
  const genreText = [book.genre, ...(book.genres ?? [])].join(" ").toLowerCase();

  switch (normalized) {
    case "romance":
      return book.genre === "Romance" || genreText.includes("romance");
    case "terror":
      return book.genre === "Terror" || /terror|horror/.test(genreText);
    case "misterio":
      return book.genre === "Terror" || /terror|horror|misterio|suspenso/.test(genreText);
    case "fantasia":
      return book.genre === "Fantasía" || genreText.includes("fantas");
    case "ciencia-ficcion":
      return book.genre === "Ciencia Ficción" || /ciencia ficción|sci-fi/.test(genreText);
    case "drama":
      return /drama|romance/.test(genreText);
    case "aventura":
      return /aventura/.test(genreText);
    case "historico":
      return /históric|historico/.test(genreText);
    default:
      return false;
  }
}
