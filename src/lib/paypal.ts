const SANDBOX_API = "https://api-m.sandbox.paypal.com";
const LIVE_API = "https://api-m.paypal.com";

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

export function isPayPalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

export function isPayPalClientEnabled(): boolean {
  return Boolean(getPayPalClientId());
}

export function getPayPalClientId(): string | undefined {
  return process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;
}

export function getPayPalMode(): "sandbox" | "live" {
  return (process.env.PAYPAL_MODE || "sandbox").toLowerCase() === "live" ? "live" : "sandbox";
}

export interface PayPalConfigStatus {
  configured: boolean;
  clientEnabled: boolean;
  mode: "sandbox" | "live";
  hasWebhookId: boolean;
  hasAppUrl: boolean;
  appBaseUrl: string;
  readyForProduction: boolean;
  missing: string[];
}

export function getPayPalConfigStatus(): PayPalConfigStatus {
  const configured = isPayPalConfigured();
  const clientEnabled = isPayPalClientEnabled();
  const mode = getPayPalMode();
  const hasWebhookId = Boolean(process.env.PAYPAL_WEBHOOK_ID?.trim());
  const appBaseUrl = getAppBaseUrl();
  const hasAppUrl = Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim());

  const missing: string[] = [];
  if (!process.env.PAYPAL_CLIENT_ID) missing.push("PAYPAL_CLIENT_ID");
  if (!process.env.PAYPAL_CLIENT_SECRET) missing.push("PAYPAL_CLIENT_SECRET");
  if (!clientEnabled) missing.push("NEXT_PUBLIC_PAYPAL_CLIENT_ID");
  if (!hasWebhookId) missing.push("PAYPAL_WEBHOOK_ID");
  if (!hasAppUrl) missing.push("NEXT_PUBLIC_APP_URL");

  const readyForProduction =
    configured &&
    clientEnabled &&
    hasWebhookId &&
    hasAppUrl &&
    mode === "live";

  return {
    configured,
    clientEnabled,
    mode,
    hasWebhookId,
    hasAppUrl,
    appBaseUrl,
    readyForProduction,
    missing,
  };
}

export async function testPayPalConnection(): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (!isPayPalConfigured()) {
    return { ok: false, error: "Credenciales de PayPal no configuradas" };
  }

  try {
    await getPayPalAccessToken();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error de conexión con PayPal",
    };
  }
}

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export function getPayPalApiBase(): string {
  const mode = (process.env.PAYPAL_MODE || "sandbox").toLowerCase();
  return mode === "live" ? LIVE_API : SANDBOX_API;
}

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET no están configurados");
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.accessToken;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal OAuth falló (${response.status}): ${text}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

export async function paypalFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await getPayPalAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  if (!headers.has("Prefer")) {
    headers.set("Prefer", "return=representation");
  }

  const response = await fetch(`${getPayPalApiBase()}${path}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const detail =
      typeof body === "object" && body !== null
        ? JSON.stringify(body)
        : String(body ?? response.statusText);
    throw new Error(`PayPal API ${path} → ${response.status}: ${detail}`);
  }

  return body as T;
}

export interface PayPalLink {
  href: string;
  rel: string;
  method?: string;
}

export function findPayPalApproveUrl(links: PayPalLink[] | undefined): string | null {
  if (!links?.length) return null;
  const approve = links.find((l) => l.rel === "approve" || l.rel === "payer-action");
  return approve?.href ?? null;
}
