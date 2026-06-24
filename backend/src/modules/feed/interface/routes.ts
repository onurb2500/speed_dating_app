import { Router } from "express";
import { prisma } from "@/config/database";
import { asyncHandler } from "@/shared/middleware/asyncHandler";
import { authGuard } from "@/shared/middleware/authGuard";
import { validateRequest } from "@/shared/middleware/validateRequest";
import { cacheService } from "@/infrastructure/cache/RedisCacheService";
import { PrismaFeedRepository } from "@/modules/feed/infrastructure/repositories/PrismaFeedRepository";
import { GetFeedUseCase } from "@/modules/feed/application/use-cases/GetFeedUseCase";
import { FeedController } from "@/modules/feed/interface/controllers/FeedController";
import { feedQuerySchema } from "@/modules/feed/interface/validators/feedValidators";

const feedRepo = new PrismaFeedRepository(prisma);
const controller = new FeedController(
  new GetFeedUseCase(feedRepo, cacheService),
);

export const feedRouter = Router();

feedRouter.get(
  "/",
  authGuard,
  validateRequest({ query: feedQuerySchema }),
  asyncHandler(controller.getFeedHandler),
);
