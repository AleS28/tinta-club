import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { getUserProfileFromFirestore } from "@/lib/firestore-admin";
import {
  getAuthorFollowerCount,
  isFollowingAuthor,
  toggleAuthorFollow,
} from "@/lib/social/followers-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ authorId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { authorId } = await context.params;
    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const decoded = idToken ? await verifyFirebaseIdToken(idToken) : null;

    const [followerCount, following] = await Promise.all([
      getAuthorFollowerCount(authorId),
      decoded?.uid ? isFollowingAuthor(decoded.uid, authorId) : Promise.resolve(false),
    ]);

    return NextResponse.json({ authorId, followerCount, isFollowing: following });
  } catch (error) {
    console.error("[authors/follow GET]", error);
    return NextResponse.json({ error: "Error al cargar seguidores" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { authorId } = await context.params;
    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
      return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded?.uid || !decoded.email) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = (await request.json()) as { action?: "follow" | "unfollow" };
    const profile = await getUserProfileFromFirestore(decoded.uid, decoded.email);
    const currentlyFollowing = await isFollowingAuthor(decoded.uid, authorId);

    const shouldFollow = body.action === "follow";
    const shouldUnfollow = body.action === "unfollow";

    if (!shouldFollow && !shouldUnfollow) {
      return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
    }

    if (shouldFollow && currentlyFollowing) {
      return NextResponse.json({
        followerCount: await getAuthorFollowerCount(authorId),
        isFollowing: true,
      });
    }

    if (shouldUnfollow && !currentlyFollowing) {
      return NextResponse.json({
        followerCount: await getAuthorFollowerCount(authorId),
        isFollowing: false,
      });
    }

    const result = await toggleAuthorFollow({
      authorId,
      followerId: decoded.uid,
      followerDisplayName: profile?.displayName ?? decoded.email ?? "Lector",
      isFollowing: currentlyFollowing,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar seguimiento";
    console.error("[authors/follow POST]", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
