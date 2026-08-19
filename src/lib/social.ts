import { DISCORD_INVITE_URL, isDiscordConfigured } from "@/lib/discord";
import { FACEBOOK_PAGE_URL, isFacebookConfigured } from "@/lib/facebook";
import { TELEGRAM_INVITE_URL, isTelegramConfigured } from "@/lib/telegram";

export type CommunitySocialKey = "discord" | "instagram" | "telegram" | "tiktok" | "x" | "facebook";

const ENV_KEYS: Record<CommunitySocialKey, string> = {
  discord: "NEXT_PUBLIC_DISCORD_INVITE_URL",
  instagram: "NEXT_PUBLIC_INSTAGRAM_URL",
  telegram: "NEXT_PUBLIC_TELEGRAM_URL",
  tiktok: "NEXT_PUBLIC_TIKTOK_URL",
  x: "NEXT_PUBLIC_X_URL",
  facebook: "NEXT_PUBLIC_FACEBOOK_URL",
};

export function getCommunitySocialUrl(key: CommunitySocialKey): string | null {
  if (key === "discord" && isDiscordConfigured()) {
    return DISCORD_INVITE_URL;
  }

  if (key === "telegram" && isTelegramConfigured()) {
    return TELEGRAM_INVITE_URL;
  }

  if (key === "facebook" && isFacebookConfigured()) {
    return FACEBOOK_PAGE_URL;
  }

  const raw = process.env[ENV_KEYS[key]]?.trim() ?? "";
  return raw.startsWith("http") ? raw : null;
}

export const COMMUNITY_SOCIAL_ORDER: CommunitySocialKey[] = [
  "discord",
  "instagram",
  "telegram",
  "tiktok",
  "x",
];

export const SIDE_BANNER_SOCIAL_ORDER = ["discord", "telegram", "instagram", "tiktok"] as const;

export type SideBannerSocialKey = (typeof SIDE_BANNER_SOCIAL_ORDER)[number];
