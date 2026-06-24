import { IVideoRepository } from "@/modules/videos/domain/repositories/IVideoRepository";
import { IVideoHostingService } from "@/modules/videos/domain/services/IVideoHostingService";
import { NotFoundError, ForbiddenError } from "@/shared/errors";
import { logger } from "@/shared/logger";

export class DeleteVideoUseCase {
  constructor(
    private readonly videos: IVideoRepository,
    private readonly hosting: IVideoHostingService,
  ) {}

  async execute(userId: string, videoId: string): Promise<void> {
    const video = await this.videos.findById(videoId);
    if (!video) {
      throw new NotFoundError("Video not found", "VIDEO_NOT_FOUND");
    }
    if (video.userId !== userId) {
      throw new ForbiddenError();
    }

    // Best-effort remote cleanup; never block deletion on provider errors.
    if (video.muxAssetId) {
      try {
        await this.hosting.deleteAsset(video.muxAssetId);
      } catch (err) {
        logger.error(
          { err, videoId, muxAssetId: video.muxAssetId },
          "Failed to delete Mux asset",
        );
      }
    }

    await this.videos.delete(videoId);
  }
}
