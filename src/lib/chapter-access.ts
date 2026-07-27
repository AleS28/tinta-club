import type { Chapter } from "@/data/mock";
import { isPremiumUser, type UserProfile } from "@/types/user";

export const PREVIEW_PARAGRAPHS = 3;

export function stripPremiumChapterContent(chapter: Chapter): Chapter {
  if (!chapter.isPremium) return chapter;

  return {
    ...chapter,
    content: chapter.content.slice(0, PREVIEW_PARAGRAPHS),
  };
}

export function canAccessFullChapter(
  chapter: Chapter,
  profile: UserProfile | null | undefined,
): boolean {
  if (!chapter.isPremium) return true;
  return isPremiumUser(profile);
}
