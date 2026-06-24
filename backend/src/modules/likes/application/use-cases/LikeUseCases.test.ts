import { describe, it, expect, vi, beforeEach } from "vitest";
import { LikeVideoUseCase } from "@/modules/likes/application/use-cases/LikeVideoUseCase";
import { UnlikeVideoUseCase } from "@/modules/likes/application/use-cases/UnlikeVideoUseCase";
import { ILikeRepository } from "@/modules/likes/domain/repositories/ILikeRepository";
import { NotFoundError } from "@/shared/errors";
import { makeCache } from "@/test/factories";

function makeLikeRepo(): ILikeRepository {
  return {
    videoExists: vi.fn().mockResolvedValue(true),
    add: vi.fn().mockResolvedValue(true),
    remove: vi.fn().mockResolvedValue(true),
    countForVideo: vi.fn().mockResolvedValue(42),
    exists: vi.fn(),
  };
}

describe("LikeVideoUseCase", () => {
  let likes: ILikeRepository;

  beforeEach(() => {
    likes = makeLikeRepo();
  });

  it("likes a video and returns the count", async () => {
    const cache = makeCache();
    const result = await new LikeVideoUseCase(likes, cache).execute(
      "user-1",
      "video-1",
    );
    expect(likes.add).toHaveBeenCalledWith("user-1", "video-1");
    expect(cache.del).toHaveBeenCalled();
    expect(result).toEqual({ likeCount: 42, liked: true });
  });

  it("is idempotent when already liked", async () => {
    (likes.add as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    const result = await new LikeVideoUseCase(likes, makeCache()).execute(
      "user-1",
      "video-1",
    );
    expect(result.liked).toBe(true);
  });

  it("throws when the video does not exist", async () => {
    (likes.videoExists as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    await expect(
      new LikeVideoUseCase(likes, makeCache()).execute("user-1", "x"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("UnlikeVideoUseCase", () => {
  it("unlikes a video", async () => {
    const likes = makeLikeRepo();
    (likes.countForVideo as ReturnType<typeof vi.fn>).mockResolvedValue(41);
    const result = await new UnlikeVideoUseCase(likes, makeCache()).execute(
      "user-1",
      "video-1",
    );
    expect(likes.remove).toHaveBeenCalledWith("user-1", "video-1");
    expect(result).toEqual({ likeCount: 41, liked: false });
  });
});
