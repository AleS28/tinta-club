import { NextResponse } from "next/server";
import { isAdminConfigured } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const configured = await isAdminConfigured();

  return NextResponse.json({
    adminConfigured: configured,
    hasProjectId: Boolean(
      process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    ),
    hasClientEmail: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
    hasPrivateKey: Boolean(process.env.FIREBASE_PRIVATE_KEY),
  });
}
