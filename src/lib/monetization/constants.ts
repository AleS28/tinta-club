/** Porcentaje del pool de suscripciones reservado para autores. */
export const AUTHORS_POOL_SHARE = 0.7;

/** Porcentaje de la plataforma sobre suscripciones. */
export const PLATFORM_POOL_SHARE = 0.3;

/** Porcentaje del autor en ventas directas de capítulos. */
export const DIRECT_SALE_AUTHOR_SHARE = 0.7;

/** Porcentaje de la plataforma en ventas directas. */
export const DIRECT_SALE_PLATFORM_SHARE = 0.3;

/** Umbral mínimo en USD para solicitar retiro. */
export const MIN_PAYOUT_USD = 50;

/** Máximo de segundos aceptados por ping de tracking (anti-abuso). */
export const MAX_READING_PING_SECONDS = 35;

/** Intervalo recomendado entre pings del cliente (segundos). */
export const READING_PING_INTERVAL_SECONDS = 30;

export const COLLECTIONS = {
  readingSessions: "reading_sessions",
  directChapterSales: "direct_chapter_sales",
  monthlyPools: "monthly_pools",
  authorEarningsSummary: "author_earnings_summary",
} as const;
