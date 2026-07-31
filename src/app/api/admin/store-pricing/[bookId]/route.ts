import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin-auth";
import { updateAdminStorePricing } from "@/lib/monetization/store-pricing-admin";
import type { UpdateStorePricingInput } from "@/types/admin-store-pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ bookId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAdminRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const { bookId } = await context.params;
    const body = (await request.json()) as UpdateStorePricingInput;

    const item = await updateAdminStorePricing(bookId, body, auth.uid);
    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al guardar el precio";
    console.error("[admin/store-pricing/[bookId]]", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
