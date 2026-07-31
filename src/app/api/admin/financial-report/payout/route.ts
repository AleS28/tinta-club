import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin-auth";
import { markAuthorPayoutPaid } from "@/lib/monetization/financial-report-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PayoutBody {
  authorId: string;
  monthYear: string;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as PayoutBody;

    if (!body.authorId || !body.monthYear) {
      return NextResponse.json(
        { error: "authorId y monthYear son requeridos" },
        { status: 400 },
      );
    }

    await markAuthorPayoutPaid(body.authorId, body.monthYear);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/financial-report/payout]", error);
    return NextResponse.json({ error: "Error al marcar pago" }, { status: 500 });
  }
}
