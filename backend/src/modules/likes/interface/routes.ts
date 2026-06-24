import { Router } from "express";
import { z } from "zod";
import { prisma } from "@/config/database";
import { asyncHandler } from "@/shared/middleware/asyncHandler";
import { authGuard } from "@/shared/middleware/authGuard";
import { validateRequest } from "@/shared/middleware/validateRequest";
import { cacheService } from "@/infrastructure/cache/RedisCacheService";
import { PrismaLikeRepository } from "@/modules/likes/infrastructure/repositories/PrismaLikeRepository";
import { LikeVideoUseCase } from "@/modules/likes/application/use-cases/LikeVideoUseCase";
import { UnlikeVideoUseCase } from "@/modules/likes/application/use-cases/UnlikeVideoUseCase";
import { LikeController } from "@/modules/likes/interface/controllers/LikeController";

const videoIdParamsSchema = z.object({ videoId: z.string().min(1) });

const likeRepo = new PrismaLikeRepository(prisma);
const controller = new LikeController(
  new LikeVideoUseCase(likeRepo, cacheService),
  new UnlikeVideoUseCase(likeRepo, cacheService),
);

/** Mounted at /videos/:videoId/likes (mergeParams to read :videoId). */
export const likesRouter = Router({ mergeParams: true });

likesRouter.post(
  "/",
  authGuard,
  validateRequest({ params: videoIdParamsSchema }),
  asyncHandler(controller.likeHandler),
);

likesRouter.delete(
  "/",
  authGuard,
  validateRequest({ params: videoIdParamsSchema }),
  asyncHandler(controller.unlikeHandler),
);
