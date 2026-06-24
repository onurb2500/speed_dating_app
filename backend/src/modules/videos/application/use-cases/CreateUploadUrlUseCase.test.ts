import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateUploadUrlUseCase } from "@/modules/videos/application/use-cases/CreateUploadUrlUseCase";
import { IVideoRepository } from "@/modules/videos/domain/repositories/IVideoRepository";
import { IVideoHostingService } from "@/modules/videos/domain/services/IVideoHostingService";
import { DurationExceededError } from "@/shared/errors";

function makeVideoRepo(): IVideoRepository {
  return {
    create: vi.fn().mockResolvedValue({
      id: "video-1",
      userId: "user-1",
      muxUploadId: "upload-1",
      muxAssetId: null,
      muxPlaybackId: null,
      duration: 30,
      status: "PROCESSING",
      confirmedAt: null,
      createdAt: new Date(),
    }),
    findById: vi.fn(),
    findByMuxUploadId: vi.fn(),
    findByMuxAssetId: vi.fn(),
    attachAsset: vi.fn(),
    markReady: vi.fn(),
    markFailed: vi.fn(),
    markConfirmed: vi.fn(),
    delete: vi.fn(),
  };
}

function makeHosting(): IVideoHostingService {
  return {
    createDirectUpload: vi
      .fn()
      .mockResolvedValue({ uploadId: "upload-1", uploadUrl: "https://mux" }),
    verifyWebhook: vi.fn(),
    deleteAsset: vi.fn(),
  };
}

describe("CreateUploadUrlUseCase", () => {
  let videos: IVideoRepository;
  let hosting: IVideoHostingService;
  let useCase: CreateUploadUrlUseCase;

  beforeEach(() => {
    videos = makeVideoRepo();
    hosting = makeHosting();
    useCase = new CreateUploadUrlUseCase(videos, hosting);
  });

  it("creates an upload URL and a PROCESSING video for valid duration", async () => {
    const result = await useCase.execute({
      userId: "user-1",
      durationSeconds: 30,
      corsOrigin: "http://localhost:3000",
    });
    expect(hosting.createDirectUpload).toHaveBeenCalledWith(
      "http://localhost:3000",
    );
    expect(videos.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", muxUploadId: "upload-1" }),
    );
    expect(result.videoId).toBe("video-1");
    expect(result.uploadUrl).toBe("https://mux");
  });

  it("rejects durations above the 45s cap", async () => {
    await expect(
      useCase.execute({
        userId: "user-1",
        durationSeconds: 46,
        corsOrigin: "x",
      }),
    ).rejects.toBeInstanceOf(DurationExceededError);
    expect(hosting.createDirectUpload).not.toHaveBeenCalled();
    expect(videos.create).not.toHaveBeenCalled();
  });
});
