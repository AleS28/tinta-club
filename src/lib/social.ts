import { DISCORD_INVITE_URL, isDiscordConfigured } from "@/lib/discord";

function envUrl(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value?.startsWith("http") ? value : undefined;
}

export type SocialPlatform = "discord" | "instagram" | "telegram" | "tiktok" | "twitter";

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  href: string;
}

const DEFAULT_INSTAGRAM =
  "https://www.instagram.com/pedrogarciamartinez16?igsh=emJ5dHFqeTF6ZWR0";

const COMMUNITY_FALLBACK = "/conocenos";

/** Enlaces de redes de la plataforma (configurables vía env). */
export function getPlatformSocialLinks(): SocialLink[] {
  const discord = isDiscordConfigured() ? DISCORD_INVITE_URL : envUrl("NEXT_PUBLIC_DISCORD_INVITE_URL");
  const instagram = envUrl("NEXT_PUBLIC_INSTAGRAM_URL") ?? DEFAULT_INSTAGRAM;
  const telegram = envUrl("NEXT_PUBLIC_TELEGRAM_URL");
  const tiktok = envUrl("NEXT_PUBLIC_TIKTOK_URL");
  const twitter = envUrl("NEXT_PUBLIC_X_URL") ?? envUrl("NEXT_PUBLIC_TWITTER_URL");

  return [
    { platform: "discord", label: "Discord", href: discord ?? COMMUNITY_FALLBACK },
    { platform: "instagram", label: "Instagram", href: instagram },
    { platform: "telegram", label: "Telegram", href: telegram ?? COMMUNITY_FALLBACK },
    { platform: "tiktok", label: "TikTok", href: tiktok ?? COMMUNITY_FALLBACK },
    { platform: "twitter", label: "X (Twitter)", href: twitter ?? COMMUNITY_FALLBACK },
  ];
}

export function getSideBannerSocialLinks(): SocialLink[] {
  return getPlatformSocialLinks().filter(({ platform }) =>
    ["discord", "instagram", "tiktok"].includes(platform),
  );
}
