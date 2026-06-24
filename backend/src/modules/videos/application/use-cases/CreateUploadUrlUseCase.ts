import { IVideoRepository } from "@/modules/videos/domain/repositories/IVideoRepository";
import { IVideoHostingService } from "@/modules/videos/domain/services/IVideoHostingService";
import { CreateUploadUrlResult } from "@/modules/videos/application/dtos/VideoDtos";
import { MAX_VIDEO_DURATION } from "@/config/constants";
import { DurationExceededError } from "@/shared/errors";

export interface CreateUploadUrlInput {
  userId: string;
  durationSeconds: number;
  corsOrigin: string;
}

/**
 * Validates duration (<= 45s), creates a Mux Direct Upload and a PROCESSING
 * Video record, and returns the signed upload URL to the client.
 */
export class CreateUploadUrlUseCase {
  constructor(
    private readonly videos: IVideoRepository,
    private readonly hosting: IVideoHostingService,
  ) {}

  async execute(input: CreateUploadUrlInput): Promise<CreateUploadUrlResult> {
    if (input.durationSeconds > MAX_VIDEO_DURATION) {
      throw new DurationExceededError();
    }

    const upload = await this.hosting.createDirectUpload(input.corsOrigin);

    const video = await this.videos.create({
      userId: input.userId,
      duration: input.durationSeconds,
      muxUploadId: upload.uploadId,
    });

    // Mux direct upload URLs are valid for ~1 hour by default.
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    return {
      videoId: video.id,
      uploadUrl: upload.uploadUrl,
      expiresAt,
    };
  }
}
