import { getAuthorProfileBySlug } from "@/data/author-profiles";

export interface FounderAuthorConfig {
  slug: string;
  legacyAuthorId: string;
  bookIds: string[];
  name: string;
  bio: string;
  photoUrl: string;
  /** Variable de entorno con email(s) permitidos, separados por coma */
  envEmailKey: string;
}

const pedroProfile = getAuthorProfileBySlug("pedro-garcia-martinez");
const willProfile = getAuthorProfileBySlug("will-flechas");

export const founderAuthors: FounderAuthorConfig[] = [
  {
    slug: "pedro-garcia-martinez",
    legacyAuthorId: "author-pedro-garcia",
    bookIds: ["pedro-amor-cafe"],
    name: pedroProfile?.name ?? "Pedro García Martínez",
    bio: pedroProfile?.bio ?? "",
    photoUrl: pedroProfile?.photoUrl ?? "",
    envEmailKey: "FOUNDER_AUTHOR_PEDRO_EMAIL",
  },
  {
    slug: "will-flechas",
    legacyAuthorId: "author-will-flechas",
    bookIds: ["will-chica-cafe", "will-whisky-por-favor"],
    name: willProfile?.name ?? "WillFlechas",
    bio: willProfile?.bio ?? "",
    photoUrl: willProfile?.photoUrl ?? "",
    envEmailKey: "FOUNDER_AUTHOR_WILL_EMAIL",
  },
];

export function getFounderEmails(config: FounderAuthorConfig): string[] {
  const raw = process.env[config.envEmailKey] ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function findFounderByEmail(email: string): FounderAuthorConfig | undefined {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return undefined;

  return founderAuthors.find((founder) => getFounderEmails(founder).includes(normalized));
}

export function findFounderBySlug(slug: string): FounderAuthorConfig | undefined {
  return founderAuthors.find((founder) => founder.slug === slug);
}
