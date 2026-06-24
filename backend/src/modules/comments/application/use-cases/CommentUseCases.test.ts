import { describe, it, expect, vi, beforeEach } from "vitest";
import { PostCommentUseCase } from "@/modules/comments/application/use-cases/PostCommentUseCase";
import { GetCommentsUseCase } from "@/modules/comments/application/use-cases/GetCommentsUseCase";
import { DeleteCommentUseCase } from "@/modules/comments/application/use-cases/DeleteCommentUseCase";
import { ICommentRepository } from "@/modules/comments/domain/repositories/ICommentRepository";
import { Comment } from "@/modules/comments/domain/entities/Comment";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "@/shared/errors";

function comment(id: string): Comment {
  return {
    id,
    videoId: "video-1",
    text: "nice",
    author: { id: "user-1", displayName: "User", avatarUrl: null },
    createdAt: new Date(),
  };
}

function makeRepo(): ICommentRepository {
  return {
    videoExists: vi.fn().mockResolvedValue(true),
    create: vi.fn().mockResolvedValue(comment("c1")),
    list: vi.fn().mockResolvedValue([]),
    findById: vi.fn(),
    delete: vi.fn(),
  };
}

describe("PostCommentUseCase", () => {
  let repo: ICommentRepository;

  beforeEach(() => {
    repo = makeRepo();
  });

  it("posts a trimmed comment", async () => {
    await new PostCommentUseCase(repo).execute("user-1", "video-1", "  hi  ");
    expect(repo.create).toHaveBeenCalledWith({
      userId: "user-1",
      videoId: "video-1",
      text: "hi",
    });
  });

  it("rejects an empty comment", async () => {
    await expect(
      new PostCommentUseCase(repo).execute("user-1", "video-1", "   "),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects a comment over 280 chars", async () => {
    await expect(
      new PostCommentUseCase(repo).execute(
        "user-1",
        "video-1",
        "a".repeat(281),
      ),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws when the video is missing", async () => {
    (repo.videoExists as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    await expect(
      new PostCommentUseCase(repo).execute("user-1", "x", "hi"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("GetCommentsUseCase", () => {
  it("paginates with hasMore detection", async () => {
    const repo = makeRepo();
    (repo.list as ReturnType<typeof vi.fn>).mockResolvedValue([
      comment("c1"),
      comment("c2"),
      comment("c3"),
    ]);
    const page = await new GetCommentsUseCase(repo).execute({
      videoId: "video-1",
      limit: 2,
    });
    expect(page.items).toHaveLength(2);
    expect(page.hasMore).toBe(true);
    expect(page.nextCursor).toBe("c2");
    // Repo is asked for limit + 1.
    expect(repo.list).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 3 }),
    );
  });
});

describe("DeleteCommentUseCase", () => {
  it("deletes the author's own comment", async () => {
    const repo = makeRepo();
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "c1",
      userId: "user-1",
    });
    await new DeleteCommentUseCase(repo).execute("user-1", "c1");
    expect(repo.delete).toHaveBeenCalledWith("c1");
  });

  it("forbids deleting another user's comment", async () => {
    const repo = makeRepo();
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "c1",
      userId: "other",
    });
    await expect(
      new DeleteCommentUseCase(repo).execute("user-1", "c1"),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("throws when comment is missing", async () => {
    const repo = makeRepo();
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(
      new DeleteCommentUseCase(repo).execute("user-1", "x"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
