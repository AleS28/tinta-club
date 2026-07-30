export function formatReadingDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0 min";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} h ${minutes} min`;
  }
  return `${minutes} min`;
}

export function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}
