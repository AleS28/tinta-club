export const DISCORD_INVITE_URL =
  process.env.NEXT_PUBLIC_DISCORD_INVITE_URL?.trim() ?? "";

export function isDiscordConfigured(): boolean {
  return DISCORD_INVITE_URL.startsWith("http");
}
