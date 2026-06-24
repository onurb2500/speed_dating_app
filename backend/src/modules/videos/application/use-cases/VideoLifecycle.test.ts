import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfirmVideoUploadUseCase } from "@/modules/videos/application/use-cases/ConfirmVideoUploadUseCase";
import { GetVideoStatusUseCase } from "@/modules/videos/application/use-cases/GetVideoStatusUseCase";
import { DeleteVideoUseCase } from "@/modules/videos/application/use-cases/DeleteVideoUseCase";
import { HandleMuxWebhookUseCase } from "@/modules/videos/application/use-cases/HandleMuxWebhookUseCase";
import { IVideoRepository } from "@/modules/videos/domain/repositories/IVideoRepository";
import { IVideoHostingService } from "@/modules/videos/domain/services/IVideoHostingService";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "@/shared/errors";
import { makeVideo, makeVideoRepo, makeHosting } from "@/test/factories";

describe("ConfirmVideoUploadUseCase", () => {
  let videos: IVideoRepository;
  let useCase: ConfirmVideoUploadUseCase;

  beforeEach(() => {
    videos = makeVideoRepo();
    useCase = new ConfirmVideoUploadUseCase(videos);
  });

  it("confirms an unconfirmed video owned by the user", async () => {
    (videos.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeVideo({ confirmedAt: null }),
    );
    const result = await useCase.execute("user-1", "video-1");
    expect(videos.markConfirmed).toHaveBeenCalledWith("video-1");
    expect(result.confirmedAt).toBeInstanceOf(Date);
  });

  it("throws when the video is missing", async () => {
    (videos.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(useCase.execute("user-1", "x")).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("forbids confirming someone else's video", async () => {
    (videos.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeVideo({ userId: "other" }),
    );
    await expect(
      useCase.execute("user-1", "video-1"),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("conflicts when already confirmed", async () => {
    (videos.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeVideo({ confirmedAt: new Date() }),
    );
    await expect(
      useCase.execute("user-1", "video-1"),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});

describe("GetVideoStatusUseCase", () => {
  it("returns the status projection", async () => {
    const videos = makeVideoRepo();
    (videos.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeVideo({ status: "READY", muxPlaybackId: "pb-1" }),
    );
    const result = await new GetVideoStatusUseCase(videos).execute("video-1");
    expect(result).toEqual({
      videoId: "video-1",
      status: "READY",
      playbackId: "pb-1",
      duration: 30,
    });
  });

  it("throws when missing", async () => {
    const videos = makeVideoRepo();
    (videos.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(
      new GetVideoStatusUseCase(videos).execute("x"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("DeleteVideoUseCase", () => {
  let videos: IVideoRepository;
  let hosting: IVideoHostingService;
  let useCase: DeleteVideoUseCase;

  beforeEach(() => {
    videos = makeVideoRepo();
    hosting = makeHosting();
    useCase = new DeleteVideoUseCase(videos, hosting);
  });

  it("deletes own video and its Mux asset", async () => {
    (videos.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeVideo({ muxAssetId: "asset-1" }),
    );
    (hosting.deleteAsset as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );
    await useCase.execute("user-1", "video-1");
    expect(hosting.deleteAsset).toHaveBeenCalledWith("asset-1");
    expect(videos.delete).toHaveBeenCalledWith("video-1");
  });

  it("forbids deleting another user's video", async () => {
    (videos.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeVideo({ userId: "other" }),
    );
    await expect(
      useCase.execute("user-1", "video-1"),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(videos.delete).not.toHaveBeenCalled();
  });

  it("still deletes if Mux asset removal fails", async () => {
    (videos.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeVideo({ muxAssetId: "asset-1" }),
    );
    (hosting.deleteAsset as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("mux down"),
    );
    await useCase.execute("user-1", "video-1");
    expect(videos.delete).toHaveBeenCalledWith("video-1");
  });
});

describe("HandleMuxWebhookUseCase", () => {
  let videos: IVideoRepository;
  let hosting: IVideoHostingService;
  let useCase: HandleMuxWebhookUseCase;

  beforeEach(() => {
    videos = makeVideoRepo();
    hosting = makeHosting();
    useCase = new HandleMuxWebhookUseCase(videos, hosting);
  });

  it("links the asset id on upload.asset_created", async () => {
    (hosting.verifyWebhook as ReturnType<typeof vi.fn>).mockReturnValue({
      type: "video.upload.asset_created",
      data: { id: "upload-1", asset_id: "asset-1" },
    });
    (videos.findByMuxUploadId as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeVideo(),
    );
    await useCase.execute("{}", "sig");
    expect(videos.attachAsset).toHaveBeenCalledWith("video-1", "asset-1");
  });

  it("marks ready on asset.ready", async () => {
    (hosting.verifyWebhook as ReturnType<typeof vi.fn>).mockReturnValue({
      type: "video.asset.ready",
      data: {
        id: "asset-1",
        playback_ids: [{ id: "pb-1" }],
        duration: 28.3,
      },
    });
    (videos.findByMuxAssetId as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeVideo({ muxAssetId: "asset-1" }),
    );
    await useCase.execute("{}", "sig");
    expect(videos.markReady).toHaveBeenCalledWith("video-1", {
      muxAssetId: "asset-1",
      muxPlaybackId: "pb-1",
      duration: 28.3,
    });
  });

  it("marks failed on asset.errored", async () => {
    (hosting.verifyWebhook as ReturnType<typeof vi.fn>).mockReturnValue({
      type: "video.asset.errored",
      data: { id: "asset-1" },
    });
    (videos.findByMuxAssetId as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeVideo({ muxAssetId: "asset-1" }),
    );
    await useCase.execute("{}", "sig");
    expect(videos.markFailed).toHaveBeenCalledWith("video-1");
  });

  it("propagates signature verification failures", async () => {
    (hosting.verifyWebhook as ReturnType<typeof vi.fn>).mockImplementation(
      () => {
        throw new Error("bad signature");
      },
    );
    await expect(useCase.execute("{}", "bad")).rejects.toThrow(
      "bad signature",
    );
  });
});
