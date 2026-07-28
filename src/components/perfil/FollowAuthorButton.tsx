"use client";

import { useEffect, useState } from "react";
import { Loader2, UserPlus, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToFollow, toggleFollow } from "@/lib/library";

interface FollowAuthorButtonProps {
  authorId: string;
  redirectPath?: string;
  className?: string;
}

export function FollowAuthorButton({
  authorId,
  redirectPath,
  className = "",
}: FollowAuthorButtonProps) {
  const { user, openAuthModal } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const isSelf = user?.uid === authorId;

  useEffect(() => {
    if (!user || isSelf) {
      setIsFollowing(false);
      setReady(true);
      return;
    }

    setReady(false);
    const unsubscribe = subscribeToFollow(user.uid, authorId, (value) => {
      setIsFollowing(value);
      setReady(true);
    });

    return unsubscribe;
  }, [user, authorId, isSelf]);

  if (isSelf) return null;

  const handleClick = async () => {
    if (!user) {
      openAuthModal(redirectPath ?? `/perfil/${authorId}`);
      return;
    }

    setLoading(true);
    try {
      await toggleFollow(user.uid, authorId, isFollowing);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || (!!user && !ready)}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors ${
        isFollowing
          ? "border border-terracotta bg-terracotta/10 text-terracotta"
          : "bg-terracotta text-white hover:bg-orange-700"
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserCheck className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {isFollowing ? "Siguiendo" : "Seguir Autor"}
    </button>
  );
}
