export type MonthlyPoolStatus = "open" | "closed";

export type PayoutStatus = "pending" | "ready_for_payout" | "paid";

export interface ReadingSession {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string;
  authorId: string;
  readingTimeSeconds: number;
  /** Segundos acreditados al pool financiero en este ping */
  poolReadingSecondsCredited?: number;
  isSubscriptionRead: boolean;
  /** +1 vista estadística (contador social del libro) */
  countsAsStatisticalView?: boolean;
  /** @deprecated Usar countsAsStatisticalView */
  countsAsPremiumView?: boolean;
  readAt: string;
}

export interface DirectChapterSale {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string;
  authorId: string;
  amountPaid: number;
  gatewayFee: number;
  amountNet: number;
  authorShare: number;
  platformShare: number;
  createdAt: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  refundedAt?: string;
  refundNet?: number;
  refundAuthorShare?: number;
}

export interface DirectBookSale {
  id: string;
  userId: string;
  bookId: string;
  authorId: string;
  amountPaid: number;
  gatewayFee: number;
  amountNet: number;
  authorShare: number;
  platformShare: number;
  createdAt: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  refundedAt?: string;
  refundNet?: number;
  refundAuthorShare?: number;
}

export interface AuthorDonation {
  id: string;
  userId: string;
  donorDisplayName: string;
  authorId: string;
  amountPaid: number;
  gatewayFee: number;
  amountNet: number;
  authorShare: number;
  platformShare: number;
  createdAt: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
}

export interface BookPurchase {
  userId: string;
  bookId: string;
  authorId: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string | null;
  purchasedAt: string;
  active: boolean;
  revokedAt?: string;
  updatedAt: string;
}

export interface ChapterPurchase {
  userId: string;
  bookId: string;
  chapterId: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string | null;
  purchasedAt: string;
  active: boolean;
  revokedAt?: string;
  updatedAt: string;
}

export type StoreSaleMode = "book" | "chapter";

export interface StoreBookListing {
  bookId: string;
  title: string;
  author: string;
  authorId: string;
  genre: string;
  rating: number;
  synopsis: string;
  coverGradient: string;
  coverAccent: string;
  coverUrl?: string;
  premiumChapterCount: number;
  totalChapterCount: number;
  saleMode: StoreSaleMode;
  priceUsd: number;
  includedInSubscription: boolean;
  firstChapterId?: string;
}

export interface MonthlyPool {
  monthYear: string;
  subscriptionGross: number;
  subscriptionGatewayFees: number;
  subscriptionNet: number;
  totalSubscriptionRevenue: number;
  authorsPool70: number;
  platformPool30: number;
  /** Base del reparto financiero del pool */
  totalPlatformReadingSeconds: number;
  valuePerSecond: number;
  /** Contador analítico — no determina regalías */
  totalPlatformPremiumViews: number;
  valuePerView: number;
  status: MonthlyPoolStatus;
  closedAt?: string;
  updatedAt: string;
  consolidationId?: string;
  consolidatedAt?: string;
  authorsConsolidatedCount?: number;
  totalPoolDistributed?: number;
  roundingAdjustmentCents?: number;
}

export interface AuthorEarningsSummary {
  authorId: string;
  monthYear: string;
  /** Segundos premium acumulados — base del reparto financiero */
  accumulatedReadingSeconds: number;
  /** @deprecated Alias — usar accumulatedReadingSeconds */
  totalReadingSeconds: number;
  /** Vistas estadísticas del mes (contador social) */
  totalViews: number;
  /** @deprecated Alias — usar totalViews */
  totalPremiumViews: number;
  estimatedSubscriptionEarnings: number;
  directSalesEarnings: number;
  donationsEarnings?: number;
  totalEarnings: number;
  isPayoutReady: boolean;
  payoutStatus?: PayoutStatus;
  paidAt?: string;
  updatedAt: string;
  frozenValuePerSecond?: number;
  /** @deprecated Alias — usar frozenValuePerSecond */
  frozenValuePerView?: number;
}

export interface AuthorChapterViewStats {
  chapterId: string;
  totalViews: number;
}

export interface AuthorBookPerformance {
  bookId: string;
  title: string;
  premiumChapterCount: number;
  totalViews: number;
  accumulatedReadingSeconds: number;
  /** @deprecated Alias */
  readingSeconds: number;
  estimatedEarnings: number;
  /** 70% autor — ventas directas individuales del mes (capítulos + libros) */
  directSalesEarnings?: number;
  chapters?: AuthorChapterViewStats[];
}

export interface AuthorEarningsDashboard {
  monthYear: string;
  estimatedBalance: number;
  subscriptionEarnings: number;
  directSalesEarnings: number;
  donationsEarnings: number;
  accumulatedReadingSeconds: number;
  totalReadingSeconds: number;
  totalViews: number;
  estimatedValuePerSecond: number;
  frozenValuePerSecond?: number;
  availableForWithdrawal: number;
  isPayoutReady: boolean;
  minPayoutThreshold: number;
  pool: {
    subscriptionGross: number;
    subscriptionGatewayFees: number;
    subscriptionNet: number;
    authorsPool70: number;
    totalPlatformReadingSeconds: number;
    valuePerSecond: number;
    totalPlatformPremiumViews: number;
    valuePerView: number;
    status: MonthlyPoolStatus;
    consolidationId?: string;
    consolidatedAt?: string;
  };
  incomeBreakdown: {
    subscriptionPercent: number;
    directSalesPercent: number;
  };
  bookPerformance: AuthorBookPerformance[];
  directSales: {
    chapterSalesAuthorShare: number;
    bookSalesAuthorShare: number;
    totalAuthorShare: number;
    byBook: Array<{
      bookId: string;
      title: string;
      chapterSalesAuthorShare: number;
      bookSalesAuthorShare: number;
      totalAuthorShare: number;
    }>;
  };
  donations: {
    totalAuthorShare: number;
    items: Array<{
      id: string;
      donorDisplayName: string;
      authorShare: number;
      createdAt: string;
    }>;
  };
}
