import { Router } from "express";
import { prisma } from "@/config/database";
import { asyncHandler } from "@/shared/middleware/asyncHandler";
import { validateRequest } from "@/shared/middleware/validateRequest";
import {
  loginLimiter,
  registerLimiter,
  publicLimiter,
} from "@/shared/middleware/rateLimiter";
import { PrismaAuthUserRepository } from "@/modules/auth/infrastructure/repositories/PrismaAuthUserRepository";
import { PrismaRefreshTokenRepository } from "@/modules/auth/infrastructure/repositories/PrismaRefreshTokenRepository";
import { RegisterUserUseCase } from "@/modules/auth/application/use-cases/RegisterUserUseCase";
import { LoginUseCase } from "@/modules/auth/application/use-cases/LoginUseCase";
import { RefreshTokenUseCase } from "@/modules/auth/application/use-cases/RefreshTokenUseCase";
import { LogoutUseCase } from "@/modules/auth/application/use-cases/LogoutUseCase";
import { AuthController } from "@/modules/auth/interface/controllers/AuthController";
import {
  registerSchema,
  loginSchema,
} from "@/modules/auth/interface/validators/authValidators";

const userRepo = new PrismaAuthUserRepository(prisma);
const tokenRepo = new PrismaRefreshTokenRepository(prisma);

const controller = new AuthController(
  new RegisterUserUseCase(userRepo, tokenRepo),
  new LoginUseCase(userRepo, tokenRepo),
  new RefreshTokenUseCase(userRepo, tokenRepo),
  new LogoutUseCase(tokenRepo),
);

export const authRouter = Router();

// PUBLIC
authRouter.post(
  "/register",
  registerLimiter,
  validateRequest({ body: registerSchema }),
  asyncHandler(controller.register),
);

// PUBLIC
authRouter.post(
  "/login",
  loginLimiter,
  validateRequest({ body: loginSchema }),
  asyncHandler(controller.loginHandler),
);

// PUBLIC (uses httpOnly cookie)
authRouter.post(
  "/refresh",
  publicLimiter,
  asyncHandler(controller.refreshHandler),
);

authRouter.post("/logout", asyncHandler(controller.logoutHandler));
