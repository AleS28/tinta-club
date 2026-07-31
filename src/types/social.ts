export interface BookLikeState {
  bookId: string;
  count: number;
  likedByMe: boolean;
}

export interface ChapterComment {
  id: string;
  chapterId: string;
  bookId: string;
  bookAuthorId: string;
  userId: string;
  userDisplayName: string;
  text: string;
  parentId?: string;
  createdAt: string;
}

export interface AuthorFollower {
  followerId: string;
  followerDisplayName: string;
  createdAt: string;
}

export interface AuthorSocialStats {
  authorId: string;
  followerCount: number;
}

export interface AuthorInteractionLike {
  type: "like";
  bookId: string;
  bookTitle: string;
  userId: string;
  userDisplayName: string;
  createdAt: string;
}

export interface AuthorInteractionComment {
  type: "comment";
  commentId: string;
  chapterId: string;
  bookId: string;
  bookTitle: string;
  chapterTitle: string;
  userId: string;
  userDisplayName: string;
  text: string;
  createdAt: string;
}

export type AuthorInteractionItem = AuthorInteractionLike | AuthorInteractionComment;

export interface AuthorInteractionsFeed {
  followerCount: number;
  followers: AuthorFollower[];
  items: AuthorInteractionItem[];
  bookLikeCounts: Array<{ bookId: string; title: string; count: number }>;
}

export interface AuthorDonationReceived {
  id: string;
  donorDisplayName: string;
  authorShare: number;
  createdAt: string;
}
