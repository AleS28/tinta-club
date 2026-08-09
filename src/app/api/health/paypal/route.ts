import { NextResponse } from "next/server";
import {
  getPayPalConfigStatus,
  testPayPalConnection,
} from "@/lib/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const status = getPayPalConfigStatus();
  const connection = status.configured ? await testPayPalConnection() : { ok: false };

  return NextResponse.json({
    ...status,
    oauthOk: connection.ok,
    oauthError: connection.ok ? undefined : connection.error,
    webhookUrl: `${status.appBaseUrl}/api/paypal/webhook`,
    returnUrl: `${status.appBaseUrl}/api/paypal/return`,
  });
}
