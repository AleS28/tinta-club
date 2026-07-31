import type { StoreSaleMode } from "@/types/monetization";

export interface AdminStorePricingItem {
  bookId: string;
  title: string;
  author: string;
  saleMode: StoreSaleMode | null;
  directBookPriceUsd: number | null;
  directChapterPriceUsd: number | null;
  effectivePriceUsd: number;
  premiumChapterCount: number;
  inStore: boolean;
  pricingSource: "firestore" | "catalog" | "default";
}

export interface UpdateStorePricingInput {
  saleMode: StoreSaleMode;
  directBookPriceUsd?: number;
  directChapterPriceUsd?: number;
}
