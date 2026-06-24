import { Router } from "express";
import { prisma } from "@/config/database";
import { asyncHandler } from "@/shared/middleware/asyncHandler";
import { authGuard } from "@/shared/middleware/authGuard";
import { validateRequest } from "@/shared/middleware/validateRequest";
import { commentLimiter } from "@/shared/middleware/rateLimiter";
import { PrismaCommentRepository } from "@/modules/comments/infrastructure/repositories/PrismaCommentRepository";
import { PostCommentUseCase } from "@/modules/comments/application/use-cases/PostCommentUseCase";
import { GetCommentsUseCase } from "@/modules/comments/application/use-cases/GetCommentsUseCase";
import { DeleteCommentUseCase } from "@/modules/comments/application/use-cases/DeleteCommentUseCase";
import { CommentController } from "@/modules/comments/interface/controllers/CommentController";
import {
  postCommentSchema,
  listCommentsQuerySchema,
  commentParamsSchema,
  commentDeleteParamsSchema,
} from "@/modules/comments/interface/validators/commentValidators";

const commentRepo = new PrismaCommentRepository(prisma);
const controller = new CommentController(
  new PostCommentUseCase(commentRepo),
  new GetCommentsUseCase(commentRepo),
  new DeleteCommentUseCase(commentRepo),
);

/** Mounted at /videos/:videoId/comments (mergeParams to read :videoId). */
export const commentsRouter = Router({ mergeParams: true });

commentsRouter.get(
  "/",
  authGuard,
  validateRequest({
    params: commentParamsSchema,
    query: listCommentsQuerySchema,
  }),
  asyncHandler(controller.listHandler),
);

commentsRouter.post(
  "/",
  authGuard,
  commentLimiter,
  validateRequest({ params: commentParamsSchema, body: postCommentSchema }),
  asyncHandler(controller.postHandler),
);

commentsRouter.delete(
  "/:commentId",
  authGuard,
  validateRequest({ params: commentDeleteParamsSchema }),
  asyncHandler(controller.deleteHandler),
);
