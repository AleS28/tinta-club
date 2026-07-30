import type { MonthlyPool } from "@/types/monetization";
import {
  AUTHORS_POOL_SHARE,
  COLLECTIONS,
  PLATFORM_POOL_SHARE,
} from "@/lib/monetization/constants";
import { getCurrentMonthYear } from "@/lib/monetization/month-year";
import { getAdminDb } from "@/lib/firebase-admin";

function normalizePool(id: string, raw: FirebaseFirestore.DocumentData): MonthlyPool {
  return {
    monthYear: id,
    totalSubscriptionRevenue: Number(raw.totalSubscriptionRevenue ?? 0),
    authorsPool70: Number(raw.authorsPool70 ?? 0),
    platformPool30: Number(raw.platformPool30 ?? 0),
    totalPlatformReadingSeconds: Number(raw.totalPlatformReadingSeconds ?? 0),
    valuePerSecond: Number(raw.valuePerSecond ?? 0),
    status: raw.status === "closed" ? "closed" : "open",
    closedAt: raw.closedAt as string | undefined,
    updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
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
    totalSubscriptionRevenue: 0,
    authorsPool70: 0,
    platformPool30: 0,
    totalPlatformReadingSeconds: 0,
    valuePerSecond: 0,
    status: "open",
    updatedAt: now,
  };

  await ref.set(empty);
  return empty;
}

export async function addSubscriptionRevenueToPool(
  amountUsd: number,
  monthYear = getCurrentMonthYear(),
): Promise<void> {
  if (amountUsd <= 0) return;

  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const ref = adminDb.collection(COLLECTIONS.monthlyPools).doc(monthYear);
  const authorsShare = amountUsd * AUTHORS_POOL_SHARE;
  const platformShare = amountUsd * PLATFORM_POOL_SHARE;

  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = new Date().toISOString();

    if (!snap.exists) {
      const total = amountUsd;
      tx.set(ref, {
        monthYear,
        totalSubscriptionRevenue: total,
        authorsPool70: authorsShare,
        platformPool30: platformShare,
        totalPlatformReadingSeconds: 0,
        valuePerSecond: 0,
        status: "open",
        updatedAt: now,
      });
      return;
    }

    const data = snap.data()!;
    if (data.status === "closed") return;

    const totalSubscriptionRevenue =
      Number(data.totalSubscriptionRevenue ?? 0) + amountUsd;
    const authorsPool70 = Number(data.authorsPool70 ?? 0) + authorsShare;
    const platformPool30 = Number(data.platformPool30 ?? 0) + platformShare;
    const totalPlatformReadingSeconds = Number(data.totalPlatformReadingSeconds ?? 0);
    const valuePerSecond =
      totalPlatformReadingSeconds > 0 ? authorsPool70 / totalPlatformReadingSeconds : 0;

    tx.update(ref, {
      totalSubscriptionRevenue,
      authorsPool70,
      platformPool30,
      valuePerSecond,
      updatedAt: now,
    });
  });
}

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
        totalSubscriptionRevenue: 0,
        authorsPool70: 0,
        platformPool30: 0,
        totalPlatformReadingSeconds: seconds,
        valuePerSecond: 0,
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
