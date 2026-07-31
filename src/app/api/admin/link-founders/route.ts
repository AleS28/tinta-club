import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin-auth";
import { linkAllFounderAuthors } from "@/lib/link-all-founders-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireAdminRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json().catch(() => ({}))) as { slugs?: string[] };
    const results = await linkAllFounderAuthors(body.slugs);

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error("[admin/link-founders]", error);
    const message = error instanceof Error ? error.message : "Error al vincular autores";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
