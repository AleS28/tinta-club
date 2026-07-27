import type { UserRole } from "@/types/user";

export interface PublicAuthorProfile {
  id: string;
  displayName: string;
  bio?: string;
  photoURL?: string;
  role?: UserRole;
  joinedAt?: string;
  isAuthor: boolean;
}
