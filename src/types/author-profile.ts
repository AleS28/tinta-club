export interface AuthorSocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  website?: string;
}

export interface AuthorFeaturedWork {
  bookId: string;
  title: string;
  genres: string[];
  isbn: string;
  synopsis: string;
  coverUrl: string;
  firstChapterId: string;
  freeChaptersCount: number;
  membershipPriceUsd: number;
}

export interface AuthorUpcomingWork {
  id: string;
  title: string;
  genre: string;
  status: "coming-soon" | "in-progress";
  coverGradient: string;
  coverAccent: string;
  teaser?: string;
}

export interface AuthorPublicProfile {
  id: string;
  slug: string;
  name: string;
  badge: string;
  bio: string;
  photoUrl: string;
  social: AuthorSocialLinks;
  featuredWork: AuthorFeaturedWork;
  upcomingWorks: AuthorUpcomingWork[];
}
