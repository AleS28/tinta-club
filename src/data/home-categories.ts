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
