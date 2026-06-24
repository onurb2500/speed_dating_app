import { Request, Response } from "express";
import { PostCommentUseCase } from "@/modules/comments/application/use-cases/PostCommentUseCase";
import { GetCommentsUseCase } from "@/modules/comments/application/use-cases/GetCommentsUseCase";
import { DeleteCommentUseCase } from "@/modules/comments/application/use-cases/DeleteCommentUseCase";
import { Comment } from "@/modules/comments/domain/entities/Comment";
import { requireUser } from "@/shared/middleware/authGuard";

function toResponse(c: Comment) {
  return {
    id: c.id,
    text: c.text,
    user: {
      id: c.author.id,
      displayName: c.author.displayName,
      avatarUrl: c.author.avatarUrl,
    },
    createdAt: c.createdAt,
  };
}

export class CommentController {
  constructor(
    private readonly postComment: PostCommentUseCase,
    private readonly getComments: GetCommentsUseCase,
    private readonly deleteComment: DeleteCommentUseCase,
  ) {}

  listHandler = async (req: Request, res: Response): Promise<void> => {
    const page = await this.getComments.execute({
      videoId: req.params.videoId,
      cursor: req.query.cursor as string | undefined,
      limit: Number(req.query.limit),
    });
    res.json({
      items: page.items.map(toResponse),
      nextCursor: page.nextCursor,
      hasMore: page.hasMore,
    });
  };

  postHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req);
    const comment = await this.postComment.execute(
      id,
      req.params.videoId,
      req.body.text,
    );
    res.status(201).json(toResponse(comment));
  };

  deleteHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req);
    await this.deleteComment.execute(id, req.params.commentId);
    res.status(204).send();
  };
}
