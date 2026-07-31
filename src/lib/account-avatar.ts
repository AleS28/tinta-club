import type { User } from "firebase/auth";
import { getAuthorProfileBySlug } from "@/data/author-profiles";
import type { UserProfile } from "@/types/user";

/** Avatar de cuenta: autores curados usan la foto del catálogo de la plataforma. */
export function resolveAccountAvatar(
  user: User | null,
  profile: UserProfile | null | undefined,
): string | undefined {
  if (profile?.authorSlug) {
    const catalog = getAuthorProfileBySlug(profile.authorSlug);
    if (catalog?.photoUrl) return catalog.photoUrl;
  }

  if (profile?.photoURL?.startsWith("/")) {
    return profile.photoURL;
  }

  if (profile?.photoURL?.startsWith("http")) {
    return profile.photoURL;
  }

  return user?.photoURL ?? undefined;
}
