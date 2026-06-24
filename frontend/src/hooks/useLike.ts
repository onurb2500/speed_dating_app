"use client";

import { useCallback } from "react";
import { api } from "@/lib/api";
import { useFeedStore } from "@/store/feedStore";
import { FeedItem } from "@/types";

interface LikeResponse {
  likeCount: number;
  liked: boolean;
}

/** Optimistic like toggle with rollback on failure. */
export function useLike() {
  const patchVideo = useFeedStore((s) => s.patchVideo);
  const videos = useFeedStore((s) => s.videos);

  const toggle = useCallback(
    async (video: FeedItem): Promise<void> => {
      const prev = videos.find((v) => v.videoId === video.videoId) ?? video;
      const optimisticLiked = !prev.liked;

      // Optimistic update.
      patchVideo(video.videoId, {
        liked: optimisticLiked,
        likeCount: prev.likeCount + (optimisticLiked ? 1 : -1),
      });

      try {
        const { data } = optimisticLiked
          ? await api.post<LikeResponse>(`/videos/${video.videoId}/likes`)
          : await api.delete<LikeResponse>(`/videos/${video.videoId}/likes`);
        patchVideo(video.videoId, {
          liked: data.liked,
          likeCount: data.likeCount,
        });
      } catch {
        // Rollback.
        patchVideo(video.videoId, {
          liked: prev.liked,
          likeCount: prev.likeCount,
        });
      }
    },
    [videos, patchVideo],
  );

  return { toggle };
}
