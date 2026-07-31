/**
 * Distribución del pool de autores con redondeo monetario determinista.
 * Usa el método de resto mayor (largest remainder) para que la suma
 * de regalías coincida exactamente con el pool.
 */

export interface AuthorShareInput {
  authorId: string;
  shareUnits: number;
}

export interface DistributedPoolResult {
  byAuthor: Map<string, number>;
  totalDistributed: number;
  roundingAdjustmentCents: number;
  unitValueExact: number;
}

function toCents(usd: number): number {
  return Math.round(usd * 100);
}

function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}

function distributePoolByUnits(
  poolAmount: number,
  authors: AuthorShareInput[],
): DistributedPoolResult {
  const poolCents = toCents(Math.max(0, poolAmount));
  const eligible = authors.filter((a) => a.shareUnits > 0);
  const totalUnits = eligible.reduce((sum, a) => sum + a.shareUnits, 0);

  const empty: DistributedPoolResult = {
    byAuthor: new Map(),
    totalDistributed: 0,
    roundingAdjustmentCents: 0,
    unitValueExact: 0,
  };

  for (const author of authors) {
    empty.byAuthor.set(author.authorId, 0);
  }

  if (poolCents <= 0 || totalUnits <= 0) {
    return empty;
  }

  const unitValueExact = poolAmount / totalUnits;

  const allocations = eligible.map((author) => {
    const exactCents = (poolCents * author.shareUnits) / totalUnits;
    const floorCents = Math.floor(exactCents);
    const remainder = exactCents - floorCents;
    return { authorId: author.authorId, floorCents, remainder };
  });

  let distributedCents = allocations.reduce((sum, row) => sum + row.floorCents, 0);
  let remainderCents = poolCents - distributedCents;

  allocations.sort((a, b) => b.remainder - a.remainder || a.authorId.localeCompare(b.authorId));

  const byAuthor = new Map<string, number>();
  for (const author of authors) {
    byAuthor.set(author.authorId, 0);
  }

  for (const row of allocations) {
    byAuthor.set(row.authorId, fromCents(row.floorCents));
  }

  let idx = 0;
  while (remainderCents > 0 && allocations.length > 0) {
    const target = allocations[idx % allocations.length]!;
    byAuthor.set(target.authorId, fromCents(toCents(byAuthor.get(target.authorId) ?? 0) + 1));
    remainderCents -= 1;
    idx += 1;
  }

  distributedCents = poolCents - remainderCents;

  return {
    byAuthor,
    totalDistributed: fromCents(distributedCents),
    roundingAdjustmentCents: remainderCents,
    unitValueExact,
  };
}

/** Reparto del pool por segundos de lectura premium acumulados. */
export function distributePoolByReadingSeconds(
  poolAmount: number,
  authors: Array<{ authorId: string; readingSeconds: number }>,
): DistributedPoolResult {
  return distributePoolByUnits(
    poolAmount,
    authors.map((author) => ({ authorId: author.authorId, shareUnits: author.readingSeconds })),
  );
}

/** Estimación en mes abierto (redondeo por autor; el cierre usa largest remainder). */
export function computeEstimatedPoolEarningsBySeconds(
  authorReadingSeconds: number,
  poolAuthorsAmount: number,
  totalPlatformReadingSeconds: number,
  frozenValuePerSecond?: number,
): { earnings: number; valuePerSecond: number } {
  if (authorReadingSeconds <= 0 || poolAuthorsAmount <= 0) {
    return { earnings: 0, valuePerSecond: frozenValuePerSecond ?? 0 };
  }

  if (totalPlatformReadingSeconds <= 0) {
    return { earnings: 0, valuePerSecond: frozenValuePerSecond ?? 0 };
  }

  const valuePerSecond =
    frozenValuePerSecond && frozenValuePerSecond > 0
      ? frozenValuePerSecond
      : poolAuthorsAmount / totalPlatformReadingSeconds;

  const earnings = Math.round(authorReadingSeconds * valuePerSecond * 100) / 100;
  return { earnings, valuePerSecond };
}

/** @deprecated Solo analítica histórica — regalías usan segundos */
export function distributePoolByPremiumViews(
  poolAmount: number,
  authors: Array<{ authorId: string; premiumViews: number }>,
): DistributedPoolResult {
  return distributePoolByUnits(
    poolAmount,
    authors.map((author) => ({ authorId: author.authorId, shareUnits: author.premiumViews })),
  );
}

/** @deprecated Solo analítica histórica */
export function computeEstimatedPoolEarnings(
  authorPremiumViews: number,
  poolAuthorsAmount: number,
  totalPlatformPremiumViews: number,
  frozenValuePerView?: number,
): { earnings: number; valuePerView: number } {
  const { earnings, valuePerSecond } = computeEstimatedPoolEarningsBySeconds(
    authorPremiumViews,
    poolAuthorsAmount,
    totalPlatformPremiumViews,
    frozenValuePerView,
  );
  return { earnings, valuePerView: valuePerSecond };
}
