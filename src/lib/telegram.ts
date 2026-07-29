const DEFAULT_TELEGRAM_URL = "https://t.me/+OJ6SMrfuzb8xNTU5";

export const TELEGRAM_INVITE_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_URL?.trim() || DEFAULT_TELEGRAM_URL;

export function isTelegramConfigured(): boolean {
  return TELEGRAM_INVITE_URL.startsWith("http");
}
