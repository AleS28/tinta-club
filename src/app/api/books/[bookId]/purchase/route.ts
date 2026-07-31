import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { getUserProfileFromFirestore } from "@/lib/firestore-admin";
import { getStripe, getAppBaseUrl, isStripeConfigured } from "@/lib/stripe";
import { getStripeCustomerId, saveStripeCustomerId } from "@/lib/subscription-admin";
import { hasBookPurchaseAccess } from "@/lib/monetization/book-access-admin";
import { getChaptersByBookId, getBookById } from "@/lib/db";
import { buildStoreListing, resolveBookPriceUsd } from "@/lib/monetization/store-catalog-admin";
import { isPremiumUser } from "@/types/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ bookId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Stripe no está configurado" }, { status: 503 });
    }

    const { bookId } = await context.params;

    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
      return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded?.uid || !decoded.email) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const book = await getBookById(bookId);
    if (!book) {
      return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 });
    }

    const chapters = await getChaptersByBookId(bookId);
    const listing = await buildStoreListing(bookId, chapters);

    if (!listing || listing.saleMode !== "book") {
      return NextResponse.json(
        { error: "Este libro no está disponible para compra completa" },
        { status: 400 },
      );
    }

    const profile = await getUserProfileFromFirestore(decoded.uid, decoded.email);
    if (profile && isPremiumUser(profile)) {
      return NextResponse.json(
        { error: "Ya tienes acceso premium con tu suscripción" },
        { status: 400 },
      );
    }

    if (await hasBookPurchaseAccess(decoded.uid, bookId)) {
      return NextResponse.json({ error: "Ya compraste este libro" }, { status: 400 });
    }

    const priceUsd = await resolveBookPriceUsd(bookId);
    const baseUrl = getAppBaseUrl();
    const stripe = getStripe();

    let customerId = await getStripeCustomerId(decoded.uid);
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: decoded.email,
        metadata: { firebaseUid: decoded.uid },
      });
      customerId = customer.id;
      await saveStripeCustomerId(decoded.uid, customerId);
    }

    const firstChapterId = listing.firstChapterId ?? chapters[0]?.id;
    const successPath = firstChapterId
      ? `/leer/${firstChapterId}?purchased=true`
      : `/mi-biblioteca?purchased=true`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(priceUsd * 100),
            product_data: {
              name: book.title,
              description:
                "Compra única — lectura de por vida en el visor de El Imperio de la Tinta (sin descarga).",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "book_purchase",
        firebaseUid: decoded.uid,
        userId: decoded.uid,
        bookId,
        authorId: book.authorId,
      },
      payment_intent_data: {
        metadata: {
          type: "book_purchase",
          firebaseUid: decoded.uid,
          bookId,
          authorId: book.authorId,
        },
      },
      success_url: `${baseUrl}${successPath}`,
      cancel_url: `${baseUrl}/tienda?purchase=canceled&bookId=${bookId}`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "No se pudo crear la sesión de pago" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url, sessionId: session.id, priceUsd });
  } catch (error) {
    console.error("[books/purchase]", error);
    return NextResponse.json({ error: "Error al iniciar la compra" }, { status: 500 });
  }
}
