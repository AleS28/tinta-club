import type { PayoutStatus } from "@/types/monetization";

export interface AuthorFinancialBreakdown {
  authorId: string;
  authorName: string;
  email: string;
  photoURL?: string;
  activeBooksCount: number;
  /** Vistas premium válidas del mes */
  premiumViews: number;
  viewSharePercent: number;
  /** Histórico analítico */
  readingTimeSeconds: number;
  poolEarnings: number;
  directSalesEarnings: number;
  totalAuthorEarnings: number;
  payoutStatus: PayoutStatus;
}

export interface BookFinancialBreakdown {
  bookId: string;
  title: string;
  authorId: string;
  authorName: string;
  premiumViews: number;
  viewSharePercent: number;
  poolEarnings: number;
}

export interface GlobalFinancialReport {
  monthYear: string;
  grossRevenue: number;
  gatewayFees: number;
  netRevenue: number;
  platformNet30: number;
  authorsPool70: number;
  /** Vistas estadísticas globales (contador social) */
  totalPlatformPremiumViews: number;
  valuePerView: number;
  /** Base del reparto financiero */
  valuePerSecond: number;
  /** Histórico analítico */
  totalPlatformReadingTime: number;
  subscriptionGross: number;
  subscriptionGatewayFees: number;
  subscriptionNet: number;
  subscriptionAuthorsPool70: number;
  subscriptionPlatformPool30: number;
  directSalesGross: number;
  directSalesGatewayFees: number;
  directSalesNet: number;
  poolStatus: "open" | "closed";
  consolidationId?: string;
  consolidatedAt?: string;
  totalPoolDistributed?: number;
  roundingAdjustmentCents?: number;
  availableMonths: string[];
  authorsBreakdown: AuthorFinancialBreakdown[];
  booksBreakdown: BookFinancialBreakdown[];
}
