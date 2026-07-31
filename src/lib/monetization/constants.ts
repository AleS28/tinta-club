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

/** Segundos activos mínimos antes de contar +1 vista estadística. */
export const STATISTICAL_VIEW_MIN_ACTIVE_SECONDS = 15;

/**
 * Ventana mínima entre vistas estadísticas para el mismo lector y capítulo.
 * Solo afecta al contador social; no limita el tiempo de lectura del pool.
 */
export const PREMIUM_VIEW_DEDUP_SECONDS = 30 * 60;

/**
 * Tope de lectura continua sin interacción (scroll/toque) por capítulo y sesión.
 * Protege el pool de suscripciones.
 */
export const READING_CAP_WITHOUT_INTERACTION_SECONDS = 20 * 60;

/** Precio por defecto de compra directa de capítulo (USD). */
export const DEFAULT_DIRECT_CHAPTER_PRICE_USD = 1;

/** Precio por defecto de compra directa de libro completo (USD). */
export const DEFAULT_DIRECT_BOOK_PRICE_USD = 9.99;

export function getDefaultStorePriceForMode(saleMode: "book" | "chapter"): number {
  return saleMode === "book" ? DEFAULT_DIRECT_BOOK_PRICE_USD : DEFAULT_DIRECT_CHAPTER_PRICE_USD;
}

export const COLLECTIONS = {
  readingSessions: "reading_sessions",
  directChapterSales: "direct_chapter_sales",
  directBookSales: "direct_book_sales",
  monthlyPools: "monthly_pools",
  authorEarningsSummary: "author_earnings_summary",
  statisticalViewWindows: "statistical_view_windows",
  readingCapSessions: "reading_cap_sessions",
  stripeProcessedEvents: "stripe_processed_events",
  chapterPurchases: "chapter_purchases",
  bookPurchases: "book_purchases",
  /** @deprecated Usar statisticalViewWindows */
  premiumViewWindows: "statistical_view_windows",
} as const;
