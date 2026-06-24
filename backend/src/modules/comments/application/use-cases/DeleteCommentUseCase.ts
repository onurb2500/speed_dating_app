import { ICommentRepository } from "@/modules/comments/domain/repositories/ICommentRepository";
import { NotFoundError, ForbiddenError } from "@/shared/errors";

export class DeleteCommentUseCase {
  constructor(private readonly comments: ICommentRepository) {}

  async execute(userId: string, commentId: string): Promise<void> {
    const comment = await this.comments.findById(commentId);
    if (!comment) {
      throw new NotFoundError("Comment not found", "NOT_FOUND");
    }
    if (comment.userId !== userId) {
      throw new ForbiddenError();
    }
    await this.comments.delete(commentId);
  }
}
