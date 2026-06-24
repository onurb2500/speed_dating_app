import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { useRecordingStore } from "@/store/recordingStore";
import { useFeedStore } from "@/store/feedStore";
import { useAuthStore } from "@/store/authStore";
import { FeedItem } from "@/types";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: { post: vi.fn(), get: vi.fn() },
  setAccessToken: vi.fn(),
}));

const mockedApi = api as unknown as { post: Mock; get: Mock };

function feedItem(id: string, over: Partial<FeedItem> = {}): FeedItem {
  return {
    videoId: id,
    playbackId: `pb-${id}`,
    duration: 30,
    user: { id: "u", displayName: "U", avatarUrl: null },
    likeCount: 0,
    commentCount: 0,
    liked: false,
    createdAt: new Date().toISOString(),
    ...over,
  };
}

describe("recordingStore", () => {
  beforeEach(() => useRecordingStore.getState().reset());

  it("updates a token value", () => {
    const { prompts, updateTokenValue } = useRecordingStore.getState();
    const id = prompts[0].id;
    updateTokenValue(id, 0, "vilã sarada");
    expect(useRecordingStore.getState().prompts[0].tokens[0].value).toBe(
      "vilã sarada",
    );
  });

  it("adds, moves and removes emojis", () => {
    const store = useRecordingStore.getState();
    store.addEmoji("🔥");
    let emojis = useRecordingStore.getState().emojis;
    expect(emojis).toHaveLength(1);

    const id = emojis[0].id;
    store.moveEmoji(id, 0.2, 0.8);
    emojis = useRecordingStore.getState().emojis;
    expect(emojis[0]).toMatchObject({ x: 0.2, y: 0.8 });

    store.removeEmoji(id);
    expect(useRecordingStore.getState().emojis).toHaveLength(0);
  });

  it("resets to initial state", () => {
    const store = useRecordingStore.getState();
    store.addEmoji("✨");
    store.setFilter("vivid");
    store.reset();
    const s = useRecordingStore.getState();
    expect(s.emojis).toHaveLength(0);
    expect(s.activeFilter).toBe("natural");
    expect(s.phase).toBe("idle");
  });
});

describe("feedStore", () => {
  beforeEach(() => useFeedStore.getState().reset());

  it("appends videos without duplicates", () => {
    const store = useFeedStore.getState();
    store.setVideos([feedItem("a"), feedItem("b")]);
    store.appendVideos([feedItem("b"), feedItem("c")]);
    expect(
      useFeedStore.getState().videos.map((v) => v.videoId),
    ).toEqual(["a", "b", "c"]);
  });

  it("patches a single video", () => {
    const store = useFeedStore.getState();
    store.setVideos([feedItem("a")]);
    store.patchVideo("a", { liked: true, likeCount: 5 });
    const v = useFeedStore.getState().videos[0];
    expect(v.liked).toBe(true);
    expect(v.likeCount).toBe(5);
  });

  it("tracks seen ids uniquely", () => {
    const store = useFeedStore.getState();
    store.markSeen("a");
    store.markSeen("a");
    store.markSeen("b");
    expect(useFeedStore.getState().seenIds).toEqual(["a", "b"]);
  });
});

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.getState().clear();
    vi.clearAllMocks();
  });

  it("restores a session via the refresh cookie on bootstrap", async () => {
    mockedApi.post.mockResolvedValue({ data: { accessToken: "tok" } });
    mockedApi.get.mockResolvedValue({
      data: { id: "u1", email: "u@e.com", displayName: "U" },
    });
    await useAuthStore.getState().bootstrap();
    const s = useAuthStore.getState();
    expect(s.status).toBe("authenticated");
    expect(s.user?.id).toBe("u1");
  });

  it("marks unauthenticated when refresh fails", async () => {
    mockedApi.post.mockRejectedValue(new Error("no cookie"));
    await useAuthStore.getState().bootstrap();
    expect(useAuthStore.getState().status).toBe("unauthenticated");
  });

  it("sets and clears a session", () => {
    useAuthStore.getState().setSession("token", {
      id: "u1",
      email: "u@e.com",
      displayName: "U",
    });
    let s = useAuthStore.getState();
    expect(s.status).toBe("authenticated");
    expect(s.accessToken).toBe("token");

    useAuthStore.getState().clear();
    s = useAuthStore.getState();
    expect(s.status).toBe("unauthenticated");
    expect(s.user).toBeNull();
  });
});
