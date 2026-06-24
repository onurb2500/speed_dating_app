import { IVideoRepository } from "@/modules/videos/domain/repositories/IVideoRepository";
import { IVideoHostingService } from "@/modules/videos/domain/services/IVideoHostingService";
import { logger } from "@/shared/logger";

/**
 * Verifies and processes Mux asset-lifecycle webhooks.
 *
 * Event sequence for a direct upload:
 *   1. video.upload.asset_created — links upload_id → asset_id
 *   2. video.asset.ready          — provides playback id (status READY)
 *   2'. video.asset.errored       — status FAILED
 */
export class HandleMuxWebhookUseCase {
  constructor(
    private readonly videos: IVideoRepository,
    private readonly hosting: IVideoHostingService,
  ) {}

  async execute(rawBody: Buffer | string, signature: string): Promise<void> {
    const event = this.hosting.verifyWebhook(rawBody, signature);

    switch (event.type) {
      case "video.upload.asset_created":
        await this.linkAsset(event.data.id, event.data.asset_id);
        break;
      case "video.asset.ready":
        await this.markReady(event.data);
        break;
      case "video.asset.errored":
        await this.markErrored(event.data.id);
        break;
      default:
        logger.debug({ type: event.type }, "Ignoring Mux webhook event");
    }
  }

  private async linkAsset(
    uploadId: string | undefined,
    assetId: string | undefined,
  ): Promise<void> {
    if (!uploadId || !assetId) return;
    const video = await this.videos.findByMuxUploadId(uploadId);
    if (!video) {
      logger.warn({ uploadId }, "No video for Mux upload id");
      return;
    }
    await this.videos.attachAsset(video.id, assetId);
  }

  private async markReady(data: {
    id?: string;
    upload_id?: string;
    playback_ids?: { id: string }[];
    duration?: number;
  }): Promise<void> {
    const assetId = data.id;
    const playbackId = data.playback_ids?.[0]?.id;
    if (!assetId || !playbackId) {
      logger.warn({ assetId }, "Mux asset.ready missing playback id");
      return;
    }

    // The asset may be located via its asset id (already linked) or, as a
    // fallback, via the originating upload id.
    let video = await this.videos.findByMuxAssetId(assetId);
    if (!video && data.upload_id) {
      video = await this.videos.findByMuxUploadId(data.upload_id);
    }
    if (!video) {
      logger.warn({ assetId }, "No video for Mux asset.ready");
      return;
    }

    await this.videos.markReady(video.id, {
      muxAssetId: assetId,
      muxPlaybackId: playbackId,
      duration: data.duration,
    });
  }

  private async markErrored(assetId: string | undefined): Promise<void> {
    if (!assetId) return;
    const video = await this.videos.findByMuxAssetId(assetId);
    if (video) {
      await this.videos.markFailed(video.id);
    }
  }
}
