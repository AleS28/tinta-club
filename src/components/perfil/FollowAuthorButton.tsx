"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, UserPlus, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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

  const loadState = useCallback(async () => {
    setReady(false);
    try {
      const headers: HeadersInit = {};
      if (user) {
        headers.Authorization = `Bearer ${await user.getIdToken()}`;
      }
      const response = await fetch(`/api/authors/${authorId}/follow`, { headers });
      const payload = (await response.json()) as { isFollowing?: boolean };
      if (response.ok) setIsFollowing(Boolean(payload.isFollowing));
    } finally {
      setReady(true);
    }
  }, [authorId, user]);

  useEffect(() => {
    if (!user || isSelf) {
      setIsFollowing(false);
      setReady(true);
      return;
    }
    void loadState();
  }, [user, isSelf, loadState]);

  if (isSelf) return null;

  const handleClick = async () => {
    if (!user) {
      openAuthModal(redirectPath ?? `/perfil/${authorId}`);
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/authors/${authorId}/follow`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: isFollowing ? "unfollow" : "follow" }),
      });
      const payload = (await response.json()) as { isFollowing?: boolean };
      if (response.ok) setIsFollowing(Boolean(payload.isFollowing));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
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
