import { Router, raw } from "express";
import { prisma } from "@/config/database";
import { asyncHandler } from "@/shared/middleware/asyncHandler";
import { authGuard } from "@/shared/middleware/authGuard";
import { validateRequest } from "@/shared/middleware/validateRequest";
import { uploadUrlLimiter } from "@/shared/middleware/rateLimiter";
import { PrismaVideoRepository } from "@/modules/videos/infrastructure/repositories/PrismaVideoRepository";
import { MuxService } from "@/modules/videos/infrastructure/services/MuxService";
import { CreateUploadUrlUseCase } from "@/modules/videos/application/use-cases/CreateUploadUrlUseCase";
import { ConfirmVideoUploadUseCase } from "@/modules/videos/application/use-cases/ConfirmVideoUploadUseCase";
import { GetVideoStatusUseCase } from "@/modules/videos/application/use-cases/GetVideoStatusUseCase";
import { DeleteVideoUseCase } from "@/modules/videos/application/use-cases/DeleteVideoUseCase";
import { HandleMuxWebhookUseCase } from "@/modules/videos/application/use-cases/HandleMuxWebhookUseCase";
import { VideoController } from "@/modules/videos/interface/controllers/VideoController";
import {
  createUploadUrlSchema,
  confirmUploadSchema,
  videoIdParamsSchema,
} from "@/modules/videos/interface/validators/videoValidators";

const videoRepo = new PrismaVideoRepository(prisma);
const muxService = new MuxService();

const controller = new VideoController(
  new CreateUploadUrlUseCase(videoRepo, muxService),
  new ConfirmVideoUploadUseCase(videoRepo),
  new GetVideoStatusUseCase(videoRepo),
  new DeleteVideoUseCase(videoRepo, muxService),
  new HandleMuxWebhookUseCase(videoRepo, muxService),
);

export const videosRouter = Router();

videosRouter.post(
  "/upload-url",
  authGuard,
  uploadUrlLimiter,
  validateRequest({ body: createUploadUrlSchema }),
  asyncHandler(controller.createUploadUrlHandler),
);

videosRouter.post(
  "/confirm",
  authGuard,
  validateRequest({ body: confirmUploadSchema }),
  asyncHandler(controller.confirmHandler),
);

videosRouter.get(
  "/:videoId/status",
  authGuard,
  validateRequest({ params: videoIdParamsSchema }),
  asyncHandler(controller.statusHandler),
);

videosRouter.delete(
  "/:videoId",
  authGuard,
  validateRequest({ params: videoIdParamsSchema }),
  asyncHandler(controller.deleteHandler),
);

/**
 * PUBLIC Mux webhook router — mounted before express.json() so the raw body
 * is available for signature verification.
 */
export const muxWebhookRouter = Router();
muxWebhookRouter.post(
  "/mux",
  raw({ type: "*/*" }),
  asyncHandler(controller.muxWebhookHandler),
);
