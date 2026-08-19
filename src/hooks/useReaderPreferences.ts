"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_READER_PREFERENCES,
  READER_FONT_SIZES,
  READER_PREFS_KEY,
  type ReaderFontPreset,
  type ReaderPreferences,
  type ReaderTheme,
  resolveReaderTheme,
} from "@/lib/reader-preferences";

function readStoredPrefs(): ReaderPreferences {
  if (typeof window === "undefined") return DEFAULT_READER_PREFERENCES;
  try {
    const raw = localStorage.getItem(READER_PREFS_KEY);
    if (!raw) return DEFAULT_READER_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<ReaderPreferences>;
    return {
      fontPreset: parsed.fontPreset ?? DEFAULT_READER_PREFERENCES.fontPreset,
      theme: parsed.theme ?? DEFAULT_READER_PREFERENCES.theme,
    };
  } catch {
    return DEFAULT_READER_PREFERENCES;
  }
}

export function useReaderPreferences() {
  const [prefs, setPrefs] = useState<ReaderPreferences>(DEFAULT_READER_PREFERENCES);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark" | "night">("light");

  useEffect(() => {
    setPrefs(readStoredPrefs());
  }, []);

  useEffect(() => {
    const resolved = resolveReaderTheme(prefs.theme);
    setResolvedTheme(resolved);

    if (prefs.theme !== "auto") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolvedTheme(resolveReaderTheme("auto"));
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [prefs.theme]);

  const persist = useCallback((next: ReaderPreferences) => {
    setPrefs(next);
    localStorage.setItem(READER_PREFS_KEY, JSON.stringify(next));
  }, []);

  const setFontPreset = useCallback(
    (fontPreset: ReaderFontPreset) => {
      persist({ ...prefs, fontPreset });
    },
    [persist, prefs],
  );

  const setTheme = useCallback(
    (theme: ReaderTheme) => {
      persist({ ...prefs, theme });
    },
    [persist, prefs],
  );

  return {
    fontPreset: prefs.fontPreset,
    fontSize: READER_FONT_SIZES[prefs.fontPreset],
    theme: prefs.theme,
    resolvedTheme,
    setFontPreset,
    setTheme,
  };
}
