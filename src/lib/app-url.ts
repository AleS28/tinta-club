export function getAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw?.startsWith("http")) return raw.replace(/\/$/, "");
  return "https://tinta-club.vercel.app";
}

export function absoluteUrl(path: string): string {
  const base = getAppUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function absoluteAssetUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return absoluteUrl(path.startsWith("/") ? path : `/${path}`);
}
