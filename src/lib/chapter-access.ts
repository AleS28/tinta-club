import type { Chapter } from "@/data/mock";
import { isPremiumUser, type UserProfile } from "@/types/user";

/** Párrafos visibles sin suscripción (fallback si el capítulo ya viene troceado). */
export const PREVIEW_PARAGRAPHS = 3;

/** Caracteres máximos de vista previa para capítulos premium. */
export const PREVIEW_CHARACTERS = 900;

export function getPremiumPreviewContent(content: string[]): string[] {
  if (content.length === 0) return [];

  const fullText = content.join("\n\n").trim();
  if (fullText.length <= PREVIEW_CHARACTERS) {
    return [fullText];
  }

  const cut = fullText.slice(0, PREVIEW_CHARACTERS);
  const lastSpace = cut.lastIndexOf(" ");
  const preview =
    lastSpace > PREVIEW_CHARACTERS * 0.6 ? cut.slice(0, lastSpace) : cut;

  return [`${preview.trim()}…`];
}

export function stripPremiumChapterContent(chapter: Chapter): Chapter {
  if (!chapter.isPremium) return chapter;

  return {
    ...chapter,
    content: getPremiumPreviewContent(chapter.content),
  };
}

export function canAccessFullChapter(
  chapter: Chapter,
  profile: UserProfile | null | undefined,
): boolean {
  if (!chapter.isPremium) return true;
  return isPremiumUser(profile);
}
