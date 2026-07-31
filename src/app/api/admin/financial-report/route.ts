import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin-auth";
import { getGlobalFinancialReport } from "@/lib/monetization/financial-report-admin";
import { getCurrentMonthYear } from "@/lib/monetization/month-year";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const monthYear =
      request.nextUrl.searchParams.get("monthYear") ?? getCurrentMonthYear();

    const report = await getGlobalFinancialReport(monthYear);
    return NextResponse.json(report);
  } catch (error) {
    console.error("[admin/financial-report]", error);
    return NextResponse.json({ error: "Error al generar el reporte" }, { status: 500 });
  }
}
