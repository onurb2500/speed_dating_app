import { Video } from "@/modules/videos/domain/entities/Video";

export interface CreateVideoInput {
  userId: string;
  duration: number;
  muxUploadId: string;
}

export interface IVideoRepository {
  create(input: CreateVideoInput): Promise<Video>;
  findById(id: string): Promise<Video | null>;
  findByMuxUploadId(uploadId: string): Promise<Video | null>;
  findByMuxAssetId(assetId: string): Promise<Video | null>;

  /** Link a Mux asset id to a video once the upload produced an asset. */
  attachAsset(id: string, muxAssetId: string): Promise<void>;

  /** Mark a video ready and store the playback id. */
  markReady(
    id: string,
    data: { muxAssetId: string; muxPlaybackId: string; duration?: number },
  ): Promise<void>;

  markFailed(id: string): Promise<void>;
  markConfirmed(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}
