import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export async function resolveUserByEmailOrUid(input: {
  email?: string;
  uid?: string;
}): Promise<{ uid: string; email: string }> {
  const adminDb = await getAdminDb();
  if (!adminDb) {
    throw new Error("Firestore Admin no disponible");
  }

  const uid = input.uid?.trim();
  const email = input.email?.trim().toLowerCase();

  if (uid) {
    const snap = await adminDb.collection("users").doc(uid).get();
    if (snap.exists) {
      const data = snap.data() ?? {};
      return { uid, email: String(data.email ?? email ?? "") };
    }

    const adminAuth = await getAdminAuth();
    if (adminAuth) {
      const user = await adminAuth.getUser(uid);
      return { uid: user.uid, email: user.email ?? email ?? "" };
    }

    return { uid, email: email ?? "" };
  }

  if (!email) {
    throw new Error("Indica email o uid");
  }

  const byEmail = await adminDb
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();

  if (!byEmail.empty) {
    const doc = byEmail.docs[0];
    return { uid: doc.id, email: String(doc.data().email ?? email) };
  }

  const adminAuth = await getAdminAuth();
  if (adminAuth) {
    const user = await adminAuth.getUserByEmail(email);
    return { uid: user.uid, email: user.email ?? email };
  }

  throw new Error(`No se encontró cuenta con email: ${email}`);
}
