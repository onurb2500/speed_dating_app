import { ILikeRepository } from "@/modules/likes/domain/repositories/ILikeRepository";
import { ICacheService } from "@/shared/cache/ICacheService";
import { CacheKeys } from "@/config/constants";
import { NotFoundError } from "@/shared/errors";

export interface LikeResult {
  likeCount: number;
  liked: boolean;
}

/** Likes a video. Idempotent — liking twice has no extra effect. */
export class LikeVideoUseCase {
  constructor(
    private readonly likes: ILikeRepository,
    private readonly cache: ICacheService,
  ) {}

  async execute(userId: string, videoId: string): Promise<LikeResult> {
    if (!(await this.likes.videoExists(videoId))) {
      throw new NotFoundError("Video not found", "VIDEO_NOT_FOUND");
    }
    await this.likes.add(userId, videoId);
    await this.cache.del(CacheKeys.videoLikes(videoId));
    const likeCount = await this.likes.countForVideo(videoId);
    return { likeCount, liked: true };
  }
}
