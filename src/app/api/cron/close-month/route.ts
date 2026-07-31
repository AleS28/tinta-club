import { NextRequest, NextResponse } from "next/server";
import { closeMonthAndConsolidate } from "@/lib/monetization/earnings-service";
import { getPreviousMonthYear } from "@/lib/monetization/month-year";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_API_SECRET ?? process.env.CRON_SECRET;
  if (!secret) return false;

  const header =
    request.headers.get("x-admin-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  return header === secret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { monthYear?: string };
    const monthYear = body.monthYear ?? getPreviousMonthYear();

    const result = await closeMonthAndConsolidate(monthYear);

    return NextResponse.json({
      ok: true,
      monthYear,
      authorsProcessed: result.authorsProcessed,
      alreadyClosed: result.alreadyClosed,
      consolidationId: result.consolidationId ?? result.pool.consolidationId,
      poolStatus: result.pool.status,
      valuePerSecond: result.pool.valuePerSecond,
      totalPlatformReadingSeconds: result.pool.totalPlatformReadingSeconds,
      totalPoolDistributed: result.pool.totalPoolDistributed,
      roundingAdjustmentCents: result.pool.roundingAdjustmentCents,
    });
  } catch (error) {
    console.error("[cron/close-month]", error);
    const message = error instanceof Error ? error.message : "Error al cerrar el mes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
