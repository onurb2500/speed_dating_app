import { Request, Response } from "express";
import { CreateUploadUrlUseCase } from "@/modules/videos/application/use-cases/CreateUploadUrlUseCase";
import { ConfirmVideoUploadUseCase } from "@/modules/videos/application/use-cases/ConfirmVideoUploadUseCase";
import { GetVideoStatusUseCase } from "@/modules/videos/application/use-cases/GetVideoStatusUseCase";
import { DeleteVideoUseCase } from "@/modules/videos/application/use-cases/DeleteVideoUseCase";
import { HandleMuxWebhookUseCase } from "@/modules/videos/application/use-cases/HandleMuxWebhookUseCase";
import { requireUser } from "@/shared/middleware/authGuard";
import { env } from "@/config/env";

export class VideoController {
  constructor(
    private readonly createUploadUrl: CreateUploadUrlUseCase,
    private readonly confirmUpload: ConfirmVideoUploadUseCase,
    private readonly getStatus: GetVideoStatusUseCase,
    private readonly deleteVideo: DeleteVideoUseCase,
    private readonly handleWebhook: HandleMuxWebhookUseCase,
  ) {}

  createUploadUrlHandler = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const { id } = requireUser(req);
    const result = await this.createUploadUrl.execute({
      userId: id,
      durationSeconds: req.body.durationSeconds,
      corsOrigin: env.CORS_ORIGINS[0] ?? "*",
    });
    res.status(201).json(result);
  };

  confirmHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req);
    const video = await this.confirmUpload.execute(id, req.body.videoId);
    res.status(200).json({ videoId: video.id, status: video.status });
  };

  statusHandler = async (req: Request, res: Response): Promise<void> => {
    const result = await this.getStatus.execute(req.params.videoId);
    res.status(200).json(result);
  };

  deleteHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req);
    await this.deleteVideo.execute(id, req.params.videoId);
    res.status(204).send();
  };

  // PUBLIC (Mux-signed). Receives the raw body buffer.
  muxWebhookHandler = async (req: Request, res: Response): Promise<void> => {
    const signature = req.header("mux-signature") ?? "";
    const rawBody: Buffer | string = Buffer.isBuffer(req.body)
      ? req.body
      : JSON.stringify(req.body);
    await this.handleWebhook.execute(rawBody, signature);
    res.status(200).json({ received: true });
  };
}
