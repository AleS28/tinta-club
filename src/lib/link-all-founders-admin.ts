import { founderAuthors, getFounderEmails } from "@/data/founder-authors";
import { linkFounderAuthorAdmin } from "@/lib/founder-author-link-admin";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export interface LinkFounderBatchResult {
  slug: string;
  email: string;
  linked: boolean;
  reason?: string;
  uid?: string;
}

async function resolveUidByEmail(
  email: string,
): Promise<{ uid: string; email: string } | null> {
  const adminAuth = await getAdminAuth();
  if (adminAuth) {
    try {
      const user = await adminAuth.getUserByEmail(email);
      return { uid: user.uid, email: user.email ?? email };
    } catch {
      // Continúa con búsqueda en Firestore.
    }
  }

  const adminDb = await getAdminDb();
  if (!adminDb) return null;

  const snap = await adminDb.collection("users").where("email", "==", email).limit(1).get();
  if (snap.empty) return null;

  const doc = snap.docs[0];
  return { uid: doc.id, email: String(doc.data().email ?? email) };
}

export async function linkAllFounderAuthors(
  slugs?: string[],
): Promise<LinkFounderBatchResult[]> {
  const adminDb = await getAdminDb();
  const adminAuth = await getAdminAuth();
  if (!adminDb && !adminAuth) {
    throw new Error("Firebase Admin no configurado");
  }

  const targets = slugs?.length
    ? founderAuthors.filter((founder) => slugs.includes(founder.slug))
    : founderAuthors;

  const results: LinkFounderBatchResult[] = [];

  for (const founder of targets) {
    const emails = getFounderEmails(founder);
    if (emails.length === 0) {
      results.push({
        slug: founder.slug,
        email: "",
        linked: false,
        reason: "missing_env_email",
      });
      continue;
    }

    const email = emails[0];
    try {
      const resolved = await resolveUidByEmail(email);
      if (!resolved) {
        results.push({
          slug: founder.slug,
          email,
          linked: false,
          reason: "firebase_user_not_found",
        });
        continue;
      }

      const result = await linkFounderAuthorAdmin(resolved.uid, email, founder);
      results.push({
        slug: founder.slug,
        email,
        linked: result.linked || result.reason === "already_linked",
        reason: result.reason,
        uid: resolved.uid,
      });
    } catch (error) {
      results.push({
        slug: founder.slug,
        email,
        linked: false,
        reason: error instanceof Error ? error.message : "link_failed",
      });
    }
  }

  return results;
}
