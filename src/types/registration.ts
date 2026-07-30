export type RegistrationAccountType = "reader" | "author";

export const REGISTRATION_TYPE_KEY = "tinta-club-registration-type";
export const NEW_AUTHOR_REDIRECT_KEY = "tinta-club-new-author";

export function readPendingRegistrationType(): RegistrationAccountType | null {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(REGISTRATION_TYPE_KEY);
  return value === "author" || value === "reader" ? value : null;
}

export function setPendingRegistrationType(type: RegistrationAccountType): void {
  sessionStorage.setItem(REGISTRATION_TYPE_KEY, type);
}

export function clearPendingRegistrationType(): void {
  sessionStorage.removeItem(REGISTRATION_TYPE_KEY);
}

export function markNewAuthorRegistration(): void {
  sessionStorage.setItem(NEW_AUTHOR_REDIRECT_KEY, "1");
}

export function consumeNewAuthorRegistration(): boolean {
  if (typeof window === "undefined") return false;
  const pending = sessionStorage.getItem(NEW_AUTHOR_REDIRECT_KEY);
  sessionStorage.removeItem(NEW_AUTHOR_REDIRECT_KEY);
  return pending === "1";
}
