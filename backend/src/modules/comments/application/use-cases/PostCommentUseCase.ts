import { ICommentRepository } from "@/modules/comments/domain/repositories/ICommentRepository";
import { Comment } from "@/modules/comments/domain/entities/Comment";
import { NotFoundError, ValidationError } from "@/shared/errors";
import { COMMENT_MAX_LENGTH } from "@/config/constants";

export class PostCommentUseCase {
  constructor(private readonly comments: ICommentRepository) {}

  async execute(
    userId: string,
    videoId: string,
    text: string,
  ): Promise<Comment> {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      throw new ValidationError("Comment cannot be empty");
    }
    if (trimmed.length > COMMENT_MAX_LENGTH) {
      throw new ValidationError(
        "Comment exceeds the maximum length",
        "COMMENT_TOO_LONG",
      );
    }
    if (!(await this.comments.videoExists(videoId))) {
      throw new NotFoundError("Video not found", "VIDEO_NOT_FOUND");
    }
    return this.comments.create({ userId, videoId, text: trimmed });
  }
}
