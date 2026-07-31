export type MonthlyPoolStatus = "open" | "closed";

export type PayoutStatus = "pending" | "ready_for_payout" | "paid";

export interface ReadingSession {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string;
  authorId: string;
  readingTimeSeconds: number;
  isSubscriptionRead: boolean;
  readAt: string;
}

export interface DirectChapterSale {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string;
  authorId: string;
  /** Monto bruto pagado por el lector */
  amountPaid: number;
  gatewayFee: number;
  amountNet: number;
  authorShare: number;
  platformShare: number;
  createdAt: string;
}

export interface MonthlyPool {
  monthYear: string;
  /** Bruto acumulado de suscripciones (antes de pasarela) */
  subscriptionGross: number;
  /** Comisiones Stripe acumuladas en suscripciones */
  subscriptionGatewayFees: number;
  /** Neto repartible de suscripciones (bruto − comisiones) */
  subscriptionNet: number;
  /** @deprecated Usar subscriptionNet — mantener por compatibilidad */
  totalSubscriptionRevenue: number;
  authorsPool70: number;
  platformPool30: number;
  totalPlatformReadingSeconds: number;
  valuePerSecond: number;
  status: MonthlyPoolStatus;
  closedAt?: string;
  updatedAt: string;
}

export interface AuthorEarningsSummary {
  authorId: string;
  monthYear: string;
  totalReadingSeconds: number;
  estimatedSubscriptionEarnings: number;
  directSalesEarnings: number;
  totalEarnings: number;
  isPayoutReady: boolean;
  payoutStatus?: PayoutStatus;
  paidAt?: string;
  updatedAt: string;
}

export interface AuthorBookPerformance {
  bookId: string;
  title: string;
  premiumChapterCount: number;
  totalViews: number;
  readingSeconds: number;
  estimatedEarnings: number;
}

export interface AuthorEarningsDashboard {
  monthYear: string;
  estimatedBalance: number;
  subscriptionEarnings: number;
  directSalesEarnings: number;
  totalReadingSeconds: number;
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
    status: MonthlyPoolStatus;
  };
  incomeBreakdown: {
    subscriptionPercent: number;
    directSalesPercent: number;
  };
  bookPerformance: AuthorBookPerformance[];
}
