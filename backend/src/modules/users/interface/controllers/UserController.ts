import { Request, Response } from "express";
import { GetUserProfileUseCase } from "@/modules/users/application/use-cases/GetUserProfileUseCase";
import { UpdateUserProfileUseCase } from "@/modules/users/application/use-cases/UpdateUserProfileUseCase";
import { User } from "@/modules/users/domain/entities/User";
import { requireUser } from "@/shared/middleware/authGuard";

function toResponse(user: User) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    savedPrompts: user.savedPrompts,
    createdAt: user.createdAt,
  };
}

export class UserController {
  constructor(
    private readonly getProfile: GetUserProfileUseCase,
    private readonly updateProfile: UpdateUserProfileUseCase,
  ) {}

  getMe = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req);
    const user = await this.getProfile.execute(id);
    res.json(toResponse(user));
  };

  updateMe = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req);
    const user = await this.updateProfile.execute(id, req.body);
    res.json(toResponse(user));
  };
}
