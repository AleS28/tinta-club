export function generateCertificateToken(): string {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CERT-2026-AUT-${suffix}`;
}

export async function generateSha256Hex(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function formatUtcTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
}
