import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { getUserProfileFromFirestore } from "@/lib/firestore-admin";
import { isAdminUser } from "@/types/user";

export async function requireAdminRequest(
  request: NextRequest,
): Promise<
  | { ok: true; uid: string; email?: string }
  | { ok: false; response: NextResponse }
> {
  const authHeader = request.headers.get("authorization");
  const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!idToken) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Autenticación requerida" }, { status: 401 }),
    };
  }

  const decoded = await verifyFirebaseIdToken(idToken);
  if (!decoded?.uid) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Token inválido" }, { status: 401 }),
    };
  }

  const profile = await getUserProfileFromFirestore(decoded.uid, decoded.email);
  if (!profile || !isAdminUser(profile)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Acceso solo para administradoras" }, { status: 403 }),
    };
  }

  return { ok: true, uid: decoded.uid, email: decoded.email };
}
