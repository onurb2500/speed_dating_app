import { Request, Response } from "express";
import { LikeVideoUseCase } from "@/modules/likes/application/use-cases/LikeVideoUseCase";
import { UnlikeVideoUseCase } from "@/modules/likes/application/use-cases/UnlikeVideoUseCase";
import { requireUser } from "@/shared/middleware/authGuard";

export class LikeController {
  constructor(
    private readonly likeVideo: LikeVideoUseCase,
    private readonly unlikeVideo: UnlikeVideoUseCase,
  ) {}

  likeHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req);
    const result = await this.likeVideo.execute(id, req.params.videoId);
    res.status(200).json(result);
  };

  unlikeHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req);
    const result = await this.unlikeVideo.execute(id, req.params.videoId);
    res.status(200).json(result);
  };
}
