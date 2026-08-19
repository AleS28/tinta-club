import { Heart, MessageCircle } from "lucide-react";

interface BookEngagementStatsProps {
  likeCount: number;
  commentCount: number;
}

export function BookEngagementStats({ likeCount, commentCount }: BookEngagementStatsProps) {
  if (likeCount === 0 && commentCount === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
      {likeCount > 0 && (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted">
          <Heart className="h-4 w-4 text-terracotta" />
          <span>
            <strong className="font-semibold text-ink">{likeCount}</strong> me gusta
          </span>
        </span>
      )}
      {commentCount > 0 && (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted">
          <MessageCircle className="h-4 w-4 text-terracotta" />
          <span>
            <strong className="font-semibold text-ink">{commentCount}</strong> comentarios de
            lectores
          </span>
        </span>
      )}
    </div>
  );
}
