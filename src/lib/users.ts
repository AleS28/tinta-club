import { doc, getDoc, Timestamp } from "firebase/firestore";
import { getAuthorProfileBySlug } from "@/data/author-profiles";
import {
  findFounderByEmail,
  findFounderByLegacyId,
  findFounderBySlug,
} from "@/data/founder-authors";
import { topAuthors } from "@/data/mock";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { PublicAuthorProfile } from "@/types/author";
import type { UserProfile } from "@/types/user";
import { normalizeUserProfile } from "@/types/user";

function formatJoinedAt(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Timestamp) {
    return value.toDate().toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  }
  if (typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    }
  }
  return undefined;
}

function resolveFounderConfig(data?: Partial<UserProfile>, authorId?: string) {
  return (
    (data?.email ? findFounderByEmail(data.email) : undefined) ??
    (data?.authorSlug ? findFounderBySlug(data.authorSlug) : undefined) ??
    (data?.legacyAuthorId ? findFounderByLegacyId(data.legacyAuthorId) : undefined) ??
    (authorId ? findFounderByLegacyId(authorId) : undefined)
  );
}

function enrichPublicAuthorProfile(
  authorId: string,
  data: UserProfile,
): PublicAuthorProfile {
  const founder = resolveFounderConfig(data, authorId);
  const catalog = founder ? getAuthorProfileBySlug(founder.slug) : undefined;

  return {
    id: authorId,
    displayName: catalog?.name ?? data.displayName,
    bio: catalog?.bio ?? data.bio ?? "Autor de narrativa independiente en El Imperio de la Tinta.",
    photoURL: catalog?.photoUrl || data.photoURL,
    role: data.role === "reader" && founder ? "author" : data.role,
    joinedAt: formatJoinedAt(data.createdAt),
    isAuthor: data.role === "author" || data.role === "admin" || Boolean(founder),
  };
}

function fromMockAuthor(authorId: string): PublicAuthorProfile | undefined {
  const mock = topAuthors.find((author) => author.id === authorId);
  if (!mock) return undefined;

  const catalog = mock.slug ? getAuthorProfileBySlug(mock.slug) : undefined;

  return {
    id: mock.id,
    displayName: catalog?.name ?? mock.name,
    bio: catalog?.bio ?? "Autor independiente de narrativa en español en El Imperio de la Tinta.",
    photoURL: catalog?.photoUrl,
    role: "author",
    isAuthor: true,
    joinedAt: "Enero 2024",
  };
}

export async function getUserProfileById(uid: string): Promise<UserProfile | undefined> {
  if (!db || !isFirebaseConfigured) return undefined;

  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return undefined;
  return normalizeUserProfile(snap.data() as UserProfile);
}

export function resolveLegacyAuthorIdForProfile(
  authorId: string,
  profile?: UserProfile,
): string | undefined {
  const founder = resolveFounderConfig(profile, authorId);
  return profile?.legacyAuthorId ?? founder?.legacyAuthorId;
}

export async function getPublicAuthorProfile(authorId: string): Promise<PublicAuthorProfile | undefined> {
  try {
    if (db && isFirebaseConfigured) {
      const snap = await getDoc(doc(db, "users", authorId));
      if (snap.exists()) {
        const data = normalizeUserProfile(snap.data() as UserProfile);
        return enrichPublicAuthorProfile(authorId, data);
      }
    }
  } catch {
    // fallback below
  }

  return fromMockAuthor(authorId);
}
