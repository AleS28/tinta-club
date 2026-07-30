import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { getUserProfileFromFirestore } from "@/lib/firestore-admin";
import { getChapterForApi } from "@/lib/firestore-admin";
import { isPremiumUser } from "@/types/user";
import { MAX_READING_PING_SECONDS } from "@/lib/monetization/constants";
import { recordReadingSession } from "@/lib/monetization/reading-tracking-admin";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TrackingBody {
  bookId: string;
  chapterId: string;
  readingTimeSeconds: number;
  isSubscriptionRead?: boolean;
}

async function resolveAuthorId(bookId: string): Promise<string | null> {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;

  const snap = await adminDb.collection("books").doc(bookId).get();
  if (!snap.exists) return null;

  const authorId = snap.data()?.authorId;
  return typeof authorId === "string" && authorId.length > 0 ? authorId : null;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
      return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded?.uid) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = (await request.json()) as TrackingBody;
    const { bookId, chapterId } = body;

    if (!bookId || !chapterId) {
      return NextResponse.json({ error: "bookId y chapterId son requeridos" }, { status: 400 });
    }

    const seconds = Math.min(
      Math.max(1, Math.floor(Number(body.readingTimeSeconds) || 0)),
      MAX_READING_PING_SECONDS,
    );

    if (seconds <= 0) {
      return NextResponse.json({ error: "readingTimeSeconds inválido" }, { status: 400 });
    }

    const chapter = await getChapterForApi(chapterId);
    if (!chapter || chapter.bookId !== bookId) {
      return NextResponse.json({ error: "Capítulo no encontrado" }, { status: 404 });
    }

    const profile = await getUserProfileFromFirestore(decoded.uid, decoded.email);
    const isSubscriptionRead =
      body.isSubscriptionRead === true &&
      chapter.isPremium &&
      !!profile &&
      isPremiumUser(profile);

    if (chapter.isPremium && body.isSubscriptionRead && !isSubscriptionRead) {
      return NextResponse.json(
        { error: "Suscripción premium requerida para tracking de pool" },
        { status: 403 },
      );
    }

    const authorId = await resolveAuthorId(bookId);
    if (!authorId) {
      return NextResponse.json({ error: "Autor no encontrado para esta obra" }, { status: 404 });
    }

    const session = await recordReadingSession({
      userId: decoded.uid,
      bookId,
      chapterId,
      authorId,
      readingTimeSeconds: seconds,
      isSubscriptionRead,
    });

    return NextResponse.json({ ok: true, sessionId: session.id });
  } catch (error) {
    console.error("[tracking/reading-time]", error);
    return NextResponse.json({ error: "Error al registrar lectura" }, { status: 500 });
  }
}
