import { IVideoRepository } from "@/modules/videos/domain/repositories/IVideoRepository";
import { VideoStatusResult } from "@/modules/videos/application/dtos/VideoDtos";
import { NotFoundError } from "@/shared/errors";

export class GetVideoStatusUseCase {
  constructor(private readonly videos: IVideoRepository) {}

  async execute(videoId: string): Promise<VideoStatusResult> {
    const video = await this.videos.findById(videoId);
    if (!video) {
      throw new NotFoundError("Video not found", "VIDEO_NOT_FOUND");
    }
    return {
      videoId: video.id,
      status: video.status,
      playbackId: video.muxPlaybackId,
      duration: video.duration,
    };
  }
}
