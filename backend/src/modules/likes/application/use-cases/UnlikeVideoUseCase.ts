import { ILikeRepository } from "@/modules/likes/domain/repositories/ILikeRepository";
import { ICacheService } from "@/shared/cache/ICacheService";
import { CacheKeys } from "@/config/constants";
import { NotFoundError } from "@/shared/errors";
import { LikeResult } from "@/modules/likes/application/use-cases/LikeVideoUseCase";

/** Unlikes a video. Idempotent. */
export class UnlikeVideoUseCase {
  constructor(
    private readonly likes: ILikeRepository,
    private readonly cache: ICacheService,
  ) {}

  async execute(userId: string, videoId: string): Promise<LikeResult> {
    if (!(await this.likes.videoExists(videoId))) {
      throw new NotFoundError("Video not found", "VIDEO_NOT_FOUND");
    }
    await this.likes.remove(userId, videoId);
    await this.cache.del(CacheKeys.videoLikes(videoId));
    const likeCount = await this.likes.countForVideo(videoId);
    return { likeCount, liked: false };
  }
}
