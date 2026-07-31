import { NextResponse } from "next/server";
import { getStoreCatalog } from "@/lib/monetization/store-catalog-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await getStoreCatalog();
    return NextResponse.json({ catalog });
  } catch (error) {
    console.error("[store/catalog]", error);
    return NextResponse.json({ error: "Error al cargar el catálogo" }, { status: 500 });
  }
}
