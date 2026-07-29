const SESSION_HINT_KEY = "tinta-club-auth-hint";

/** Indica al UI que probablemente hay sesión guardada mientras Firebase restaura el token. */
export function markAuthSessionHint(uid: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_HINT_KEY, uid);
}

export function clearAuthSessionHint(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_HINT_KEY);
}

export function readAuthSessionHint(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_HINT_KEY);
}
