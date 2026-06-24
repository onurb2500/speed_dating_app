import { create } from "zustand";
import { FeedItem } from "@/types";

interface FeedState {
  videos: FeedItem[];
  currentIndex: number;
  seenIds: string[];
  nextCursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  isOffline: boolean;

  setVideos: (videos: FeedItem[]) => void;
  appendVideos: (videos: FeedItem[]) => void;
  setCurrentIndex: (index: number) => void;
  markSeen: (videoId: string) => void;
  setPagination: (nextCursor: string | null, hasMore: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setOffline: (isOffline: boolean) => void;
  /** Patch like state/count for a single video (optimistic updates). */
  patchVideo: (videoId: string, patch: Partial<FeedItem>) => void;
  reset: () => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  videos: [],
  currentIndex: 0,
  seenIds: [],
  nextCursor: null,
  hasMore: true,
  isLoading: false,
  isOffline: false,

  setVideos: (videos) => set({ videos }),
  appendVideos: (videos) =>
    set((state) => {
      const existing = new Set(state.videos.map((v) => v.videoId));
      const fresh = videos.filter((v) => !existing.has(v.videoId));
      return { videos: [...state.videos, ...fresh] };
    }),

  setCurrentIndex: (index) => set({ currentIndex: index }),

  markSeen: (videoId) =>
    set((state) =>
      state.seenIds.includes(videoId)
        ? state
        : { seenIds: [...state.seenIds, videoId] },
    ),

  setPagination: (nextCursor, hasMore) => set({ nextCursor, hasMore }),
  setLoading: (isLoading) => set({ isLoading }),
  setOffline: (isOffline) => set({ isOffline }),

  patchVideo: (videoId, patch) =>
    set((state) => ({
      videos: state.videos.map((v) =>
        v.videoId === videoId ? { ...v, ...patch } : v,
      ),
    })),

  reset: () =>
    set({
      videos: [],
      currentIndex: 0,
      seenIds: [],
      nextCursor: null,
      hasMore: true,
      isLoading: false,
      isOffline: false,
    }),
}));
