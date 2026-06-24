import { Request, Response, NextFunction } from "express";
import { AppError } from "@/shared/errors";
import { logger } from "@/shared/logger";

/**
 * Global error middleware — must be registered LAST in the chain.
 * Maps AppError subclasses to JSON; never leaks internals on 500.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // next is required for Express to treat this as an error handler.
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({ err }, "Non-operational AppError");
    }
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
  });
}
