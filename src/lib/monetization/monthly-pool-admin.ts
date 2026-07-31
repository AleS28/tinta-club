import type { MonthlyPool } from "@/types/monetization";
import {
  AUTHORS_POOL_SHARE,
  COLLECTIONS,
  PLATFORM_POOL_SHARE,
} from "@/lib/monetization/constants";
import { getCurrentMonthYear } from "@/lib/monetization/month-year";
import type { RevenueAmounts } from "@/lib/monetization/stripe-net";
import { getAdminDb } from "@/lib/firebase-admin";

function normalizePool(id: string, raw: FirebaseFirestore.DocumentData): MonthlyPool {
  const subscriptionGross = Number(
    raw.subscriptionGross ?? raw.totalSubscriptionRevenue ?? 0,
  );
  const subscriptionGatewayFees = Number(raw.subscriptionGatewayFees ?? 0);
  const subscriptionNet = Number(
    raw.subscriptionNet ??
      raw.totalSubscriptionRevenue ??
      Math.max(0, subscriptionGross - subscriptionGatewayFees),
  );
  const authorsPool70 = Number(raw.authorsPool70 ?? 0);
  const totalPlatformPremiumViews = Number(raw.totalPlatformPremiumViews ?? 0);
  const totalPlatformReadingSeconds = Number(raw.totalPlatformReadingSeconds ?? 0);

  const valuePerView =
    Number(raw.valuePerView ?? 0) ||
    (totalPlatformPremiumViews > 0 && authorsPool70 > 0
      ? authorsPool70 / totalPlatformPremiumViews
      : 0);

  const valuePerSecond =
    Number(raw.valuePerSecond ?? 0) ||
    (totalPlatformReadingSeconds > 0 && authorsPool70 > 0
      ? authorsPool70 / totalPlatformReadingSeconds
      : 0);

  return {
    monthYear: id,
    subscriptionGross,
    subscriptionGatewayFees,
    subscriptionNet,
    totalSubscriptionRevenue: subscriptionNet,
    authorsPool70,
    platformPool30: Number(raw.platformPool30 ?? 0),
    totalPlatformReadingSeconds,
    valuePerSecond,
    totalPlatformPremiumViews,
    valuePerView,
    status: raw.status === "closed" ? "closed" : "open",
    closedAt: raw.closedAt as string | undefined,
    updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
    consolidationId: raw.consolidationId as string | undefined,
    consolidatedAt: raw.consolidatedAt as string | undefined,
    authorsConsolidatedCount: Number(raw.authorsConsolidatedCount ?? 0) || undefined,
    totalPoolDistributed: Number(raw.totalPoolDistributed ?? 0) || undefined,
    roundingAdjustmentCents: Number(raw.roundingAdjustmentCents ?? 0) || undefined,
  };
}

function computeValuePerSecond(pool: MonthlyPool): number {
  if (pool.totalPlatformReadingSeconds <= 0 || pool.authorsPool70 <= 0) return 0;
  return pool.authorsPool70 / pool.totalPlatformReadingSeconds;
}

export async function getOrCreateOpenPool(monthYear = getCurrentMonthYear()): Promise<MonthlyPool> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const ref = adminDb.collection(COLLECTIONS.monthlyPools).doc(monthYear);
  const snap = await ref.get();

  if (snap.exists) {
    return normalizePool(monthYear, snap.data()!);
  }

  const now = new Date().toISOString();
  const empty: MonthlyPool = {
    monthYear,
    subscriptionGross: 0,
    subscriptionGatewayFees: 0,
    subscriptionNet: 0,
    totalSubscriptionRevenue: 0,
    authorsPool70: 0,
    platformPool30: 0,
    totalPlatformReadingSeconds: 0,
    valuePerSecond: 0,
    totalPlatformPremiumViews: 0,
    valuePerView: 0,
    status: "open",
    updatedAt: now,
  };

  await ref.set(empty);
  return empty;
}

/** Registra ingreso de suscripción: el 70/30 se aplica sobre el neto post-Stripe. */
export async function addSubscriptionRevenueToPool(
  amounts: RevenueAmounts,
  monthYear = getCurrentMonthYear(),
): Promise<void> {
  const { grossUsd, feeUsd, netUsd } = amounts;
  if (netUsd === 0 && grossUsd === 0 && feeUsd === 0) return;

  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const ref = adminDb.collection(COLLECTIONS.monthlyPools).doc(monthYear);
  const authorsShare = netUsd * AUTHORS_POOL_SHARE;
  const platformShare = netUsd * PLATFORM_POOL_SHARE;

  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = new Date().toISOString();

    if (!snap.exists) {
      tx.set(ref, {
        monthYear,
        subscriptionGross: grossUsd,
        subscriptionGatewayFees: feeUsd,
        subscriptionNet: netUsd,
        totalSubscriptionRevenue: netUsd,
        authorsPool70: authorsShare,
        platformPool30: platformShare,
        totalPlatformReadingSeconds: 0,
        valuePerSecond: 0,
        totalPlatformPremiumViews: 0,
        valuePerView: 0,
        status: "open",
        updatedAt: now,
      });
      return;
    }

    const data = snap.data()!;
    if (data.status === "closed") return;

    const subscriptionGross = Math.max(
      0,
      Number(data.subscriptionGross ?? data.totalSubscriptionRevenue ?? 0) + grossUsd,
    );
    const subscriptionGatewayFees = Math.max(
      0,
      Number(data.subscriptionGatewayFees ?? 0) + feeUsd,
    );
    const subscriptionNet = Math.max(
      0,
      Number(data.subscriptionNet ?? data.totalSubscriptionRevenue ?? 0) + netUsd,
    );
    const authorsPool70 = Math.max(0, Number(data.authorsPool70 ?? 0) + authorsShare);
    const platformPool30 = Math.max(0, Number(data.platformPool30 ?? 0) + platformShare);
    const totalPlatformPremiumViews = Number(data.totalPlatformPremiumViews ?? 0);
    const totalPlatformReadingSeconds = Number(data.totalPlatformReadingSeconds ?? 0);
    const valuePerView =
      totalPlatformPremiumViews > 0 ? authorsPool70 / totalPlatformPremiumViews : 0;
    const valuePerSecond =
      totalPlatformReadingSeconds > 0 ? authorsPool70 / totalPlatformReadingSeconds : 0;

    tx.update(ref, {
      subscriptionGross,
      subscriptionGatewayFees,
      subscriptionNet,
      totalSubscriptionRevenue: subscriptionNet,
      authorsPool70,
      platformPool30,
      valuePerView,
      valuePerSecond,
      updatedAt: now,
    });
  });
}

/** Histórico analítico — ya no determina regalías del pool. */
export async function incrementPoolReadingSeconds(
  seconds: number,
  monthYear = getCurrentMonthYear(),
): Promise<void> {
  if (seconds <= 0) return;

  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const ref = adminDb.collection(COLLECTIONS.monthlyPools).doc(monthYear);

  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = new Date().toISOString();

    if (!snap.exists) {
      tx.set(ref, {
        monthYear,
        subscriptionGross: 0,
        subscriptionGatewayFees: 0,
        subscriptionNet: 0,
        totalSubscriptionRevenue: 0,
        authorsPool70: 0,
        platformPool30: 0,
        totalPlatformReadingSeconds: seconds,
        valuePerSecond: 0,
        totalPlatformPremiumViews: 0,
        valuePerView: 0,
        status: "open",
        updatedAt: now,
      });
      return;
    }

    const data = snap.data()!;
    if (data.status === "closed") return;

    const totalPlatformReadingSeconds =
      Number(data.totalPlatformReadingSeconds ?? 0) + seconds;
    const authorsPool70 = Number(data.authorsPool70 ?? 0);
    const valuePerSecond =
      totalPlatformReadingSeconds > 0 ? authorsPool70 / totalPlatformReadingSeconds : 0;

    tx.update(ref, {
      totalPlatformReadingSeconds,
      valuePerSecond,
      updatedAt: now,
    });
  });
}

export async function incrementPoolPremiumViews(
  views: number,
  monthYear = getCurrentMonthYear(),
): Promise<void> {
  if (views <= 0) return;

  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const ref = adminDb.collection(COLLECTIONS.monthlyPools).doc(monthYear);

  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = new Date().toISOString();

    if (!snap.exists) {
      tx.set(ref, {
        monthYear,
        subscriptionGross: 0,
        subscriptionGatewayFees: 0,
        subscriptionNet: 0,
        totalSubscriptionRevenue: 0,
        authorsPool70: 0,
        platformPool30: 0,
        totalPlatformReadingSeconds: 0,
        valuePerSecond: 0,
        totalPlatformPremiumViews: views,
        valuePerView: 0,
        status: "open",
        updatedAt: now,
      });
      return;
    }

    const data = snap.data()!;
    if (data.status === "closed") return;

    const totalPlatformPremiumViews = Number(data.totalPlatformPremiumViews ?? 0) + views;
    const authorsPool70 = Number(data.authorsPool70 ?? 0);
    const valuePerView =
      totalPlatformPremiumViews > 0 ? authorsPool70 / totalPlatformPremiumViews : 0;

    tx.update(ref, {
      totalPlatformPremiumViews,
      valuePerView,
      updatedAt: now,
    });
  });
}

export async function closeMonthlyPool(monthYear: string): Promise<MonthlyPool> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const ref = adminDb.collection(COLLECTIONS.monthlyPools).doc(monthYear);

  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      throw new Error(`Pool ${monthYear} no existe`);
    }

    const data = snap.data()!;
    const pool = normalizePool(monthYear, data);
    const valuePerSecond = computeValuePerSecond(pool);
    const now = new Date().toISOString();

    if (pool.status === "closed") {
      return;
    }

    tx.update(ref, {
      valuePerSecond,
      status: "closed",
      closedAt: now,
      updatedAt: now,
    });
  });

  const closed = await ref.get();
  return normalizePool(monthYear, closed.data()!);
}

export async function getMonthlyPool(monthYear: string): Promise<MonthlyPool | null> {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;

  const snap = await adminDb.collection(COLLECTIONS.monthlyPools).doc(monthYear).get();
  if (!snap.exists) return null;
  return normalizePool(monthYear, snap.data()!);
}

export async function markPoolConsolidated(
  monthYear: string,
  payload: {
    consolidationId: string;
    authorsConsolidatedCount: number;
    totalPoolDistributed: number;
    roundingAdjustmentCents: number;
    valuePerSecond: number;
  },
): Promise<void> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const ref = adminDb.collection(COLLECTIONS.monthlyPools).doc(monthYear);
  const now = new Date().toISOString();

  await ref.set(
    {
      consolidationId: payload.consolidationId,
      consolidatedAt: now,
      authorsConsolidatedCount: payload.authorsConsolidatedCount,
      totalPoolDistributed: payload.totalPoolDistributed,
      roundingAdjustmentCents: payload.roundingAdjustmentCents,
      valuePerSecond: payload.valuePerSecond,
      updatedAt: now,
    },
    { merge: true },
  );
}
