import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetFeedUseCase } from "@/modules/feed/application/use-cases/GetFeedUseCase";
import { IFeedRepository } from "@/modules/feed/domain/repositories/IFeedRepository";
import {
  FeedItem,
  FeedCandidate,
} from "@/modules/feed/domain/entities/FeedItem";
import { makeCache } from "@/test/factories";

function candidate(id: string): FeedCandidate {
  return { id, createdAt: new Date().toISOString() };
}

function item(videoId: string): FeedItem {
  return {
    videoId,
    playbackId: `pb-${videoId}`,
    duration: 30,
    user: { id: "u", displayName: "U", avatarUrl: null },
    likeCount: 0,
    commentCount: 0,
    liked: false,
    createdAt: new Date(),
  };
}

function makeFeedRepo(ids: string[]): IFeedRepository {
  return {
    listCandidates: vi.fn().mockResolvedValue(ids.map(candidate)),
    hydrate: vi.fn(async (videoIds: string[]) => videoIds.map(item)),
  };
}

describe("GetFeedUseCase", () => {
  let cache: ReturnType<typeof makeCache>;

  beforeEach(() => {
    cache = makeCache();
  });

  it("returns the first page and caches the pool", async () => {
    const repo = makeFeedRepo(["v1", "v2", "v3"]);
    const result = await new GetFeedUseCase(repo, cache).execute({
      viewerId: "user-1",
      limit: 2,
      seenVideoIds: [],
    });
    expect(result.items.map((i) => i.videoId)).toEqual(["v1", "v2"]);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBe("v2");
    expect(cache.set).toHaveBeenCalled();
  });

  it("excludes videos already seen this session", async () => {
    const repo = makeFeedRepo(["v1", "v2", "v3"]);
    const result = await new GetFeedUseCase(repo, cache).execute({
      viewerId: "user-1",
      limit: 10,
      seenVideoIds: ["v1", "v2"],
    });
    expect(result.items.map((i) => i.videoId)).toEqual(["v3"]);
    expect(result.hasMore).toBe(false);
  });

  it("advances past the cursor", async () => {
    const repo = makeFeedRepo(["v1", "v2", "v3", "v4"]);
    const result = await new GetFeedUseCase(repo, cache).execute({
      viewerId: "user-1",
      cursor: "v2",
      limit: 10,
      seenVideoIds: [],
    });
    expect(result.items.map((i) => i.videoId)).toEqual(["v3", "v4"]);
  });

  it("reuses the cached pool instead of re-querying", async () => {
    const repo = makeFeedRepo(["v1", "v2"]);
    const useCase = new GetFeedUseCase(repo, cache);
    await useCase.execute({ viewerId: "user-1", limit: 10, seenVideoIds: [] });
    await useCase.execute({ viewerId: "user-1", limit: 10, seenVideoIds: [] });
    expect(repo.listCandidates).toHaveBeenCalledOnce();
  });
});
