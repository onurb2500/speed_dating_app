import Redis from "ioredis";
import { env, isProduction } from "@/config/env";
import { logger } from "@/shared/logger";

/**
 * ioredis client singleton. Reused across hot-reloads in dev.
 * `lazyConnect` defers the connection until the first command, so importing
 * this module (e.g. in tests) never opens a socket.
 */
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

// Prevent unhandled 'error' events from crashing the process; the cache
// layer already degrades gracefully on failures.
redis.on("error", (err) => {
  logger.error({ err }, "Redis connection error");
});

if (!isProduction) {
  globalForRedis.redis = redis;
}
