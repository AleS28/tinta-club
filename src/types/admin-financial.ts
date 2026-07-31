import type { PayoutStatus } from "@/types/monetization";

export interface AuthorFinancialBreakdown {
  authorId: string;
  authorName: string;
  email: string;
  photoURL?: string;
  activeBooksCount: number;
  readingTimeSeconds: number;
  poolEarnings: number;
  directSalesEarnings: number;
  totalAuthorEarnings: number;
  payoutStatus: PayoutStatus;
}

export interface GlobalFinancialReport {
  monthYear: string;
  grossRevenue: number;
  platformNet30: number;
  authorsPool70: number;
  totalPlatformReadingTime: number;
  subscriptionRevenue: number;
  directSalesGross: number;
  poolStatus: "open" | "closed";
  availableMonths: string[];
  authorsBreakdown: AuthorFinancialBreakdown[];
}
