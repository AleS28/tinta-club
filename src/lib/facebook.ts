/** Página oficial en Facebook: El Imperio de la Tinta */
const DEFAULT_FACEBOOK_URL = "https://www.facebook.com/elimperiodelatinta";

export const FACEBOOK_PAGE_URL =
  process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim() || DEFAULT_FACEBOOK_URL;

export function isFacebookConfigured(): boolean {
  return FACEBOOK_PAGE_URL.startsWith("http");
}
