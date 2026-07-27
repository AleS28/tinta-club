import { doc, getDoc, Timestamp } from "firebase/firestore";
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

function fromMockAuthor(authorId: string): PublicAuthorProfile | undefined {
  const mock = topAuthors.find((author) => author.id === authorId);
  if (!mock) return undefined;

  return {
    id: mock.id,
    displayName: mock.name,
    bio: "Autor independiente de narrativa en español en Tinta Club.",
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

export async function getPublicAuthorProfile(authorId: string): Promise<PublicAuthorProfile | undefined> {
  try {
    if (db && isFirebaseConfigured) {
      const snap = await getDoc(doc(db, "users", authorId));
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        return {
          id: authorId,
          displayName: data.displayName,
          bio: data.bio ?? "Autor de narrativa independiente en Tinta Club.",
          photoURL: data.photoURL,
          role: data.role,
          joinedAt: formatJoinedAt(data.createdAt),
          isAuthor: data.role === "author" || data.role === "admin",
        };
      }
    }
  } catch {
    // fallback below
  }

  return fromMockAuthor(authorId);
}
