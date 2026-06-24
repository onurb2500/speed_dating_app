"use client";

import { useCallback, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useFeedStore } from "@/store/feedStore";
import { useOfflineCache } from "@/hooks/useOfflineCache";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { FeedResponse } from "@/types";
import { FEED_PAGE_DEFAULT, OFFLINE_PREFETCH_COUNT } from "@/lib/constants";

/**
 * Feed data hook: cursor pagination with seen-dedupe, offline fallback to the
 * IndexedDB cache, and post-session pre-caching of the next videos.
 */
export function useFeed() {
  const online = useOnlineStatus();
  const {
    videos,
    seenIds,
    nextCursor,
    hasMore,
    isLoading,
    setVideos,
    appendVideos,
    setPagination,
    setLoading,
    setOffline,
    markSeen,
  } = useFeedStore();
  const { cacheFeed, getCachedFeed } = useOfflineCache();
  const initialised = useRef(false);

  const fetchPage = useCallback(
    async (cursor: string | null): Promise<void> => {
      setLoading(true);
      try {
        const { data } = await api.get<FeedResponse>("/feed", {
          params: { cursor: cursor ?? undefined, limit: FEED_PAGE_DEFAULT },
          headers: seenIds.length
            ? { "X-Seen-Videos": seenIds.join(",") }
            : undefined,
        });
        if (cursor) appendVideos(data.items);
        else setVideos(data.items);
        setPagination(data.nextCursor, data.hasMore);
        setOffline(false);
      } finally {
        setLoading(false);
      }
    },
    [seenIds, appendVideos, setVideos, setPagination, setLoading, setOffline],
  );

  // Initial load (online → network, offline → cache).
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    if (online) {
      void fetchPage(null);
    } else {
      void getCachedFeed().then((cached) => {
        setVideos(cached);
        setPagination(null, false);
        setOffline(true);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  // Pre-cache the first few videos for offline use whenever the feed grows.
  useEffect(() => {
    if (videos.length > 0) {
      void cacheFeed(videos.slice(0, OFFLINE_PREFETCH_COUNT));
    }
  }, [videos, cacheFeed]);

  const loadMore = useCallback(() => {
    if (online && hasMore && !isLoading) {
      void fetchPage(nextCursor);
    }
  }, [online, hasMore, isLoading, nextCursor, fetchPage]);

  return { videos, isLoading, hasMore, loadMore, markSeen };
}
