"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useFeedStore } from "@/store/feedStore";
import { Comment, CommentsResponse } from "@/types";

/** Paginated comment fetch + optimistic post for a single video. */
export function useComments(videoId: string | null) {
  const patchVideo = useFeedStore((s) => s.patchVideo);
  const [comments, setComments] = useState<Comment[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (reset: boolean): Promise<void> => {
      if (!videoId) return;
      setLoading(true);
      try {
        const { data } = await api.get<CommentsResponse>(
          `/videos/${videoId}/comments`,
          { params: { cursor: reset ? undefined : cursor ?? undefined } },
        );
        setComments((prev) => (reset ? data.items : [...prev, ...data.items]));
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } finally {
        setLoading(false);
      }
    },
    [videoId, cursor],
  );

  // Reset + load when the target video changes.
  useEffect(() => {
    setComments([]);
    setCursor(null);
    setHasMore(false);
    if (videoId) void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const post = useCallback(
    async (text: string): Promise<void> => {
      if (!videoId || !text.trim()) return;
      const { data } = await api.post<Comment>(
        `/videos/${videoId}/comments`,
        { text: text.trim() },
      );
      setComments((prev) => [data, ...prev]);
      const current = useFeedStore.getState().videos.find(
        (v) => v.videoId === videoId,
      );
      if (current) {
        patchVideo(videoId, { commentCount: current.commentCount + 1 });
      }
    },
    [videoId, patchVideo],
  );

  return {
    comments,
    hasMore,
    loading,
    loadMore: () => load(false),
    post,
  };
}
