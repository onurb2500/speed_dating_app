import pino from "pino";
import { env, isProduction, isTest } from "@/config/env";

/**
 * Structured Pino logger. Never use console.log in application code.
 */
export const logger = pino({
  level: isTest ? "silent" : isProduction ? "info" : "debug",
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:HH:MM:ss" },
      },
  base: { env: env.NODE_ENV },
});
