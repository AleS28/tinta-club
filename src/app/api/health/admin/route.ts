import { NextResponse } from "next/server";
import { isAdminConfigured, probeAdminServices } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const configured = await isAdminConfigured();
  const services = configured ? await probeAdminServices() : { auth: false, firestore: false };

  return NextResponse.json({
    adminConfigured: configured,
    authAvailable: services.auth,
    firestoreAvailable: services.firestore,
    hasProjectId: Boolean(
      process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    ),
    hasClientEmail: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
    hasPrivateKey: Boolean(process.env.FIREBASE_PRIVATE_KEY),
  });
}
