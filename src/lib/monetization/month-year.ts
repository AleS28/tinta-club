/** Formato YYYY-MM en UTC. */
export function getCurrentMonthYear(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function getMonthYearFromUnixSeconds(unixSeconds: number): string {
  return getCurrentMonthYear(new Date(unixSeconds * 1000));
}

export function getPreviousMonthYear(date = new Date()): string {
  const prev = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
  return getCurrentMonthYear(prev);
}
