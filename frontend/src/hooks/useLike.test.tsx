import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLike } from "@/hooks/useLike";
import { useFeedStore } from "@/store/feedStore";
import { FeedItem } from "@/types";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: { post: vi.fn(), delete: vi.fn() },
}));

const mockedApi = api as unknown as { post: Mock; delete: Mock };

function video(over: Partial<FeedItem> = {}): FeedItem {
  return {
    videoId: "v1",
    playbackId: "pb",
    duration: 30,
    user: { id: "u", displayName: "U", avatarUrl: null },
    likeCount: 10,
    commentCount: 0,
    liked: false,
    createdAt: new Date().toISOString(),
    ...over,
  };
}

describe("useLike", () => {
  beforeEach(() => {
    useFeedStore.getState().reset();
    vi.clearAllMocks();
  });

  it("optimistically likes then reconciles with the server", async () => {
    useFeedStore.getState().setVideos([video()]);
    mockedApi.post.mockResolvedValue({ data: { likeCount: 11, liked: true } });

    const { result } = renderHook(() => useLike());
    await act(async () => {
      await result.current.toggle(video());
    });

    const v = useFeedStore.getState().videos[0];
    expect(v.liked).toBe(true);
    expect(v.likeCount).toBe(11);
    expect(mockedApi.post).toHaveBeenCalledWith("/videos/v1/likes");
  });

  it("rolls back when the request fails", async () => {
    useFeedStore.getState().setVideos([video()]);
    mockedApi.post.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useLike());
    await act(async () => {
      await result.current.toggle(video());
    });

    const v = useFeedStore.getState().videos[0];
    expect(v.liked).toBe(false);
    expect(v.likeCount).toBe(10);
  });
});
