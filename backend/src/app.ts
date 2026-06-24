import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "@/config/env";
import { requestLogger } from "@/shared/middleware/requestLogger";
import { errorHandler } from "@/shared/middleware/errorHandler";
import { generalLimiter } from "@/shared/middleware/rateLimiter";
import { NotFoundError } from "@/shared/errors";
import { authRouter } from "@/modules/auth/interface/routes";
import { usersRouter } from "@/modules/users/interface/routes";
import {
  videosRouter,
  muxWebhookRouter,
} from "@/modules/videos/interface/routes";
import { feedRouter } from "@/modules/feed/interface/routes";
import { likesRouter } from "@/modules/likes/interface/routes";
import { commentsRouter } from "@/modules/comments/interface/routes";

/** Builds and configures the Express application (no listening). */
export function createApp(): Express {
  const app = express();

  app.set("trust proxy", 1);

  // Security headers.
  app.use(helmet());

  // Strict CORS allowlist (credentials for the refresh cookie).
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
      exposedHeaders: ["RateLimit-Limit", "RateLimit-Remaining"],
    }),
  );

  // Health check (PUBLIC).
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // Mux webhook must read the RAW body for signature verification —
  // mounted BEFORE express.json().
  app.use("/webhooks", muxWebhookRouter);

  // Global middleware for the JSON API.
  app.use(express.json({ limit: "10kb" }));
  app.use(cookieParser());
  app.use(requestLogger);
  app.use(generalLimiter);

  // Feature routers.
  app.use("/auth", authRouter);
  app.use("/users", usersRouter);
  app.use("/videos", videosRouter);
  app.use("/videos/:videoId/likes", likesRouter);
  app.use("/videos/:videoId/comments", commentsRouter);
  app.use("/feed", feedRouter);

  // Unknown route → 404.
  app.use((_req: Request, _res: Response, next) => {
    next(new NotFoundError("Route not found", "NOT_FOUND"));
  });

  // Global error handler — must be LAST.
  app.use(errorHandler);

  return app;
}
