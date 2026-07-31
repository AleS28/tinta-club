"use client";

import { useEffect, useState } from "react";

interface AuthorFollowerCountProps {
  authorId: string;
  className?: string;
}

export function AuthorFollowerCount({ authorId, className = "" }: AuthorFollowerCountProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/authors/${authorId}/follow`)
      .then((res) => res.json())
      .then((payload: { followerCount?: number }) => {
        if (typeof payload.followerCount === "number") setCount(payload.followerCount);
      })
      .catch(() => setCount(0));
  }, [authorId]);

  if (count === null) return null;

  return (
    <p className={`text-sm text-muted ${className}`}>
      {count} {count === 1 ? "seguidor" : "seguidores"}
    </p>
  );
}
