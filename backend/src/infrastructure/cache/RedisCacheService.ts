import type Redis from "ioredis";
import { ICacheService } from "@/shared/cache/ICacheService";
import { redis } from "@/config/redis";
import { logger } from "@/shared/logger";

/**
 * Redis-backed cache. Cache failures are logged and swallowed — a cache
 * outage degrades performance but must never break a request.
 */
export class RedisCacheService implements ICacheService {
  constructor(private readonly client: Redis = redis) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      logger.error({ err, key }, "Cache get failed");
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (err) {
      logger.error({ err, key }, "Cache set failed");
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      logger.error({ err, key }, "Cache del failed");
    }
  }
}

/** Shared singleton instance. */
export const cacheService = new RedisCacheService();
