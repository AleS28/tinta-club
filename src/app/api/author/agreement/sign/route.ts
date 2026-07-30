import { NextRequest, NextResponse } from "next/server";
import type { AuthorAgreementData } from "@/types/author-agreement";
import { signAuthorAgreementAdmin } from "@/lib/author-agreement-admin";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { getUserProfileFromFirestore } from "@/lib/firestore-admin";
import { normalizeUserProfile, type UserProfile } from "@/types/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SignAgreementBody extends AuthorAgreementData {
  ownsRights?: boolean;
  acceptsSplit?: boolean;
  acceptsExclusivity?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
      return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded?.uid || !decoded.email) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = (await request.json()) as SignAgreementBody;

    if (!body.ownsRights || !body.acceptsSplit || !body.acceptsExclusivity) {
      return NextResponse.json(
        { error: "Debes aceptar todas las cláusulas del acuerdo." },
        { status: 400 },
      );
    }

    const result = await signAuthorAgreementAdmin(decoded.uid, decoded.email, {
      legalFullName: body.legalFullName ?? "",
      legalIdNumber: body.legalIdNumber ?? "",
      contactPhone: body.contactPhone ?? "",
      paymentDetails: body.paymentDetails ?? "",
      signatureName: body.signatureName ?? "",
    });

    const profile = await getUserProfileFromFirestore(decoded.uid, decoded.email);
    const normalizedProfile: UserProfile | null = profile ? normalizeUserProfile(profile) : null;

    return NextResponse.json({
      ...result,
      profile: normalizedProfile,
    });
  } catch (error) {
    console.error("[author/agreement/sign]", error);
    const message = error instanceof Error ? error.message : "Error al firmar el acuerdo";
    const status = message.includes("obligatorio") || message.includes("al menos") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
      return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded?.uid) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const profile = await getUserProfileFromFirestore(decoded.uid, decoded.email);
    if (!profile) {
      return NextResponse.json({ agreementSigned: false });
    }

    return NextResponse.json({
      agreementSigned: profile.agreementSigned === true,
      agreementVersion: profile.agreementVersion,
      agreementSignedAt: profile.agreementSignedAt,
      legalFullName: profile.legalFullName,
    });
  } catch (error) {
    console.error("[author/agreement/sign GET]", error);
    return NextResponse.json({ error: "No se pudo consultar el acuerdo" }, { status: 500 });
  }
}
