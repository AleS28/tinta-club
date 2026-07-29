/** Emails con rol administrador (acceso total). Separados por coma en SITE_ADMIN_EMAILS. */
export function getSiteAdminEmails(): string[] {
  const raw = process.env.SITE_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isSiteAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  return getSiteAdminEmails().includes(normalized);
}
