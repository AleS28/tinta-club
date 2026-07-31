import { founderAuthors, getFounderEmails, isFounderAuthorIdentity } from "@/data/founder-authors";
import { getAdminDb } from "@/lib/firebase-admin";

export interface ResolvedAuthorIdentity {
  /** UID de Firebase si está vinculado; si no, el ID legacy del catálogo. */
  canonicalId: string;
  /** Todos los IDs que representan al mismo autor (uid + legacy). */
  aliasIds: string[];
  displayName: string;
  email: string;
  photoURL?: string;
  isLinked: boolean;
}

function mergeIdentity(
  existing: ResolvedAuthorIdentity | undefined,
  next: ResolvedAuthorIdentity,
): ResolvedAuthorIdentity {
  if (!existing) return next;

  const aliasIds = Array.from(new Set([...existing.aliasIds, ...next.aliasIds]));
  return {
    canonicalId: next.isLinked ? next.canonicalId : existing.canonicalId,
    aliasIds,
    displayName: next.displayName || existing.displayName,
    email: next.email || existing.email,
    photoURL: next.photoURL ?? existing.photoURL,
    isLinked: existing.isLinked || next.isLinked,
  };
}

function registerIdentity(
  index: Map<string, ResolvedAuthorIdentity>,
  identity: ResolvedAuthorIdentity,
): void {
  const existing = index.get(identity.canonicalId);
  const merged = mergeIdentity(existing, identity);

  index.set(merged.canonicalId, merged);
  for (const aliasId of merged.aliasIds) {
    index.set(aliasId, merged);
  }
}

/**
 * Índice de autores del catálogo, fundadores y cuentas vinculadas en Firestore.
 * Permite resolver IDs legacy (p. ej. author-pedro-garcia) al UID de Firebase.
 */
export async function buildAuthorIdentityIndex(): Promise<
  Map<string, ResolvedAuthorIdentity>
> {
  const adminDb = await getAdminDb();
  const index = new Map<string, ResolvedAuthorIdentity>();
  if (!adminDb) {
    for (const founder of founderAuthors) {
      registerIdentity(index, {
        canonicalId: founder.legacyAuthorId,
        aliasIds: [founder.legacyAuthorId],
        displayName: founder.name,
        email: getFounderEmails(founder)[0] ?? "",
        photoURL: founder.photoUrl,
        isLinked: false,
      });
    }
    return index;
  }

  const legacyToUid = new Map<string, string>();
  const authorsSnap = await adminDb.collection("authors").get();
  for (const doc of authorsSnap.docs) {
    const linkedUid = doc.data().linkedUid;
    if (linkedUid) legacyToUid.set(doc.id, String(linkedUid));
  }

  for (const founder of founderAuthors) {
    const uid = legacyToUid.get(founder.legacyAuthorId);
    const canonicalId = uid ?? founder.legacyAuthorId;
    const aliasIds = uid ? [uid, founder.legacyAuthorId] : [founder.legacyAuthorId];

    registerIdentity(index, {
      canonicalId,
      aliasIds,
      displayName: founder.name,
      email: getFounderEmails(founder)[0] ?? "",
      photoURL: founder.photoUrl,
      isLinked: Boolean(uid),
    });
  }

  const usersSnap = await adminDb.collection("users").where("role", "==", "author").get();
  for (const doc of usersSnap.docs) {
    const data = doc.data();
    const legacyId = data.legacyAuthorId ? String(data.legacyAuthorId) : undefined;
    const authorSlug = data.authorSlug ? String(data.authorSlug) : undefined;
    const founder =
      (legacyId ? founderAuthors.find((f) => f.legacyAuthorId === legacyId) : undefined) ??
      (authorSlug ? founderAuthors.find((f) => f.slug === authorSlug) : undefined);

    if (!founder) continue;

    const uid = doc.id;
    const aliasIds = legacyId ? [uid, legacyId] : [uid];

    registerIdentity(index, {
      canonicalId: uid,
      aliasIds,
      displayName: String(data.displayName ?? founder.name),
      email: String(data.email ?? getFounderEmails(founder)[0] ?? ""),
      photoURL: (data.photoURL as string | undefined) ?? founder.photoUrl,
      isLinked: true,
    });
  }

  return index;
}

export function resolveAuthorFromIndex(
  authorId: string,
  index: Map<string, ResolvedAuthorIdentity>,
): ResolvedAuthorIdentity {
  const known = index.get(authorId);
  if (known) return known;

  return {
    canonicalId: authorId,
    aliasIds: [authorId],
    displayName: "Autor",
    email: "",
    isLinked: false,
  };
}

export function listCanonicalAuthorIdentities(
  index: Map<string, ResolvedAuthorIdentity>,
): ResolvedAuthorIdentity[] {
  const seen = new Set<string>();
  const identities: ResolvedAuthorIdentity[] = [];

  for (const identity of index.values()) {
    if (seen.has(identity.canonicalId)) continue;
    if (!isFounderAuthorIdentity(identity)) continue;
    seen.add(identity.canonicalId);
    identities.push(identity);
  }

  return identities;
}
