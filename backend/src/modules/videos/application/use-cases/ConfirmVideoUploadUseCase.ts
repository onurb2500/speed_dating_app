import { IVideoRepository } from "@/modules/videos/domain/repositories/IVideoRepository";
import { Video } from "@/modules/videos/domain/entities/Video";
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from "@/shared/errors";

/**
 * Called by the client after it finishes PUTting the blob to Mux.
 * Records the confirmation so the backend knows to expect the webhook.
 */
export class ConfirmVideoUploadUseCase {
  constructor(private readonly videos: IVideoRepository) {}

  async execute(userId: string, videoId: string): Promise<Video> {
    const video = await this.videos.findById(videoId);
    if (!video) {
      throw new NotFoundError("Video not found", "VIDEO_NOT_FOUND");
    }
    if (video.userId !== userId) {
      throw new ForbiddenError();
    }
    if (video.confirmedAt) {
      throw new ConflictError(
        "Video already confirmed",
        "VIDEO_ALREADY_CONFIRMED",
      );
    }

    await this.videos.markConfirmed(videoId);
    return { ...video, confirmedAt: new Date() };
  }
}
