import { ICommentRepository } from "@/modules/comments/domain/repositories/ICommentRepository";
import { Comment } from "@/modules/comments/domain/entities/Comment";
import { buildCursorPage, CursorPage } from "@/shared/utils/pagination";
import { NotFoundError } from "@/shared/errors";

export interface GetCommentsInput {
  videoId: string;
  cursor?: string;
  limit: number;
}

export class GetCommentsUseCase {
  constructor(private readonly comments: ICommentRepository) {}

  async execute(input: GetCommentsInput): Promise<CursorPage<Comment>> {
    if (!(await this.comments.videoExists(input.videoId))) {
      throw new NotFoundError("Video not found", "VIDEO_NOT_FOUND");
    }
    // Fetch limit + 1 to determine hasMore.
    const rows = await this.comments.list({
      videoId: input.videoId,
      cursor: input.cursor,
      limit: input.limit + 1,
    });
    return buildCursorPage(rows, input.limit);
  }
}
