import { vi } from "vitest";
import { IVideoRepository } from "@/modules/videos/domain/repositories/IVideoRepository";
import { IVideoHostingService } from "@/modules/videos/domain/services/IVideoHostingService";
import { Video } from "@/modules/videos/domain/entities/Video";
import { ICacheService } from "@/shared/cache/ICacheService";

export function makeVideo(overrides: Partial<Video> = {}): Video {
  return {
    id: "video-1",
    userId: "user-1",
    muxUploadId: "upload-1",
    muxAssetId: null,
    muxPlaybackId: null,
    duration: 30,
    status: "PROCESSING",
    confirmedAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}

export function makeVideoRepo(): IVideoRepository {
  return {
    create: vi.fn(),
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

export function makeHosting(): IVideoHostingService {
  return {
    createDirectUpload: vi.fn(),
    verifyWebhook: vi.fn(),
    deleteAsset: vi.fn(),
  };
}

/** In-memory cache double for use-case tests. */
export function makeCache(): ICacheService {
  const store = new Map<string, unknown>();
  return {
    get: vi.fn(async (key: string) => (store.get(key) ?? null) as never),
    set: vi.fn(async (key: string, value: unknown) => {
      store.set(key, value);
    }),
    del: vi.fn(async (key: string) => {
      store.delete(key);
    }),
  };
}
