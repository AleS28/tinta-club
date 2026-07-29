const DEFAULT_DISCORD_URL = "https://discord.gg/bUxCczqaS";

export const DISCORD_INVITE_URL =
  process.env.NEXT_PUBLIC_DISCORD_INVITE_URL?.trim() || DEFAULT_DISCORD_URL;

export function isDiscordConfigured(): boolean {
  return DISCORD_INVITE_URL.startsWith("http");
}
