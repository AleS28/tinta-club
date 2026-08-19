export type ReaderFontPreset = "small" | "medium" | "large";
export type ReaderTheme = "light" | "dark" | "auto" | "night";

export const READER_FONT_SIZES: Record<ReaderFontPreset, number> = {
  small: 16,
  medium: 18,
  large: 22,
};

export const READER_PREFS_KEY = "tinta-reader-prefs";

export interface ReaderPreferences {
  fontPreset: ReaderFontPreset;
  theme: ReaderTheme;
}

export const DEFAULT_READER_PREFERENCES: ReaderPreferences = {
  fontPreset: "medium",
  theme: "light",
};

export function resolveReaderTheme(theme: ReaderTheme): "light" | "dark" | "night" {
  if (theme === "auto") {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }
  return theme;
}

export function getReaderSurfaceClass(resolved: "light" | "dark" | "night"): string {
  switch (resolved) {
    case "dark":
      return "reader-surface-dark";
    case "night":
      return "reader-surface-night";
    default:
      return "reader-surface-light";
  }
}
