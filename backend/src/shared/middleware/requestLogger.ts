import { pinoHttp } from "pino-http";
import { logger } from "@/shared/logger";

/** Pino HTTP request logger. */
export const requestLogger = pinoHttp({
  logger,
  // Reduce noise: health checks at debug level.
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
});
