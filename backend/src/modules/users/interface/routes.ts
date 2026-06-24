import { Router } from "express";
import { prisma } from "@/config/database";
import { asyncHandler } from "@/shared/middleware/asyncHandler";
import { authGuard } from "@/shared/middleware/authGuard";
import { validateRequest } from "@/shared/middleware/validateRequest";
import { PrismaUserRepository } from "@/modules/users/infrastructure/repositories/PrismaUserRepository";
import { GetUserProfileUseCase } from "@/modules/users/application/use-cases/GetUserProfileUseCase";
import { UpdateUserProfileUseCase } from "@/modules/users/application/use-cases/UpdateUserProfileUseCase";
import { UserController } from "@/modules/users/interface/controllers/UserController";
import { updateUserSchema } from "@/modules/users/interface/validators/userValidators";

const userRepo = new PrismaUserRepository(prisma);
const controller = new UserController(
  new GetUserProfileUseCase(userRepo),
  new UpdateUserProfileUseCase(userRepo),
);

export const usersRouter = Router();

usersRouter.get("/me", authGuard, asyncHandler(controller.getMe));

usersRouter.patch(
  "/me",
  authGuard,
  validateRequest({ body: updateUserSchema }),
  asyncHandler(controller.updateMe),
);
