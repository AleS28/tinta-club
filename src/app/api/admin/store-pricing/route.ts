import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin-auth";
import { getAdminStorePricingList } from "@/lib/monetization/store-pricing-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const items = await getAdminStorePricingList();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[admin/store-pricing]", error);
    return NextResponse.json({ error: "Error al cargar precios de la tienda" }, { status: 500 });
  }
}
