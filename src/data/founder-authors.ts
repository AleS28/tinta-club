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
  /** Emails oficiales del fundador (respaldo para vinculación admin). */
  knownEmails?: string[];
}

const pedroProfile = getAuthorProfileBySlug("pedro-garcia-martinez");
const willProfile = getAuthorProfileBySlug("will-flechas");

export const founderAuthors: FounderAuthorConfig[] = [
  {
    slug: "pedro-garcia-martinez",
    legacyAuthorId: "author-pedro-garcia",
    bookIds: ["pedro-amor-cafe", "pedro-el-titere"],
    name: pedroProfile?.name ?? "Pedro García Martínez",
    bio: pedroProfile?.bio ?? "",
    photoUrl: pedroProfile?.photoUrl ?? "",
    envEmailKey: "FOUNDER_AUTHOR_PEDRO_EMAIL",
    knownEmails: ["pgarcialiteratura@gmail.com"],
  },
  {
    slug: "will-flechas",
    legacyAuthorId: "author-will-flechas",
    bookIds: ["will-chica-cafe", "will-whisky-por-favor"],
    name: willProfile?.name ?? "WillFlechas",
    bio: willProfile?.bio ?? "",
    photoUrl: willProfile?.photoUrl ?? "",
    envEmailKey: "FOUNDER_AUTHOR_WILL_EMAIL",
    knownEmails: ["willflechas77@gmail.com"],
  },
];

export function getFounderEmails(config: FounderAuthorConfig): string[] {
  const raw = process.env[config.envEmailKey] ?? "";
  const fromEnv = raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const fromKnown = (config.knownEmails ?? []).map((email) => email.trim().toLowerCase()).filter(Boolean);

  return Array.from(new Set([...fromEnv, ...fromKnown]));
}

export function findFounderByEmail(email: string): FounderAuthorConfig | undefined {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return undefined;

  return founderAuthors.find((founder) => getFounderEmails(founder).includes(normalized));
}

export function findFounderBySlug(slug: string): FounderAuthorConfig | undefined {
  return founderAuthors.find((founder) => founder.slug === slug);
}

export function findFounderByLegacyId(legacyAuthorId: string): FounderAuthorConfig | undefined {
  return founderAuthors.find((founder) => founder.legacyAuthorId === legacyAuthorId);
}

/** Autores reales de la plataforma (fundadores vinculados o del catálogo). */
export function isRealPlatformAuthorRef(params: {
  authorId?: string;
  legacyAuthorId?: string;
  authorSlug?: string;
}): boolean {
  if (params.legacyAuthorId && findFounderByLegacyId(params.legacyAuthorId)) return true;
  if (params.authorSlug && findFounderBySlug(params.authorSlug)) return true;
  if (params.authorId && findFounderByLegacyId(params.authorId)) return true;
  return false;
}

export function isFounderAuthorIdentity(identity: {
  canonicalId: string;
  aliasIds: string[];
}): boolean {
  return founderAuthors.some(
    (founder) =>
      identity.aliasIds.includes(founder.legacyAuthorId) ||
      identity.canonicalId === founder.legacyAuthorId,
  );
}
