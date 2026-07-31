export function formatMonthYearLabel(monthYear: string): string {
  const [year, month] = monthYear.split("-").map(Number);
  if (!year || !month) return monthYear;

  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat("es", { month: "long", year: "numeric" }).format(date);
}

export function formatMonthYearCapitalized(monthYear: string): string {
  const label = formatMonthYearLabel(monthYear);
  return label.charAt(0).toUpperCase() + label.slice(1);
}
