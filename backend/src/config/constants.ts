/** App-wide constants. No environment access here — see config/env.ts. */

/** Maximum video duration in seconds, enforced on client and server. */
export const MAX_VIDEO_DURATION = 45;

/** Maximum upload size in bytes (100 MB). */
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024;

/** Access token TTL (15 minutes). */
export const ACCESS_TOKEN_TTL = "15m";

/** Refresh token TTL in days. */
export const REFRESH_TOKEN_TTL_DAYS = 7;

/** Comment length bounds. */
export const COMMENT_MIN_LENGTH = 1;
export const COMMENT_MAX_LENGTH = 280;

/** Pagination defaults. */
export const FEED_PAGE_DEFAULT = 10;
export const FEED_PAGE_MAX = 20;
export const COMMENTS_PAGE_DEFAULT = 20;
export const COMMENTS_PAGE_MAX = 50;

/** Redis cache key builders + TTLs (seconds). */
export const CacheKeys = {
  feedPool: (userId: string) => `feed:pool:${userId}`,
  video: (videoId: string) => `video:${videoId}`,
  videoLikes: (videoId: string) => `video:${videoId}:likes`,
} as const;

export const CacheTTL = {
  feedPool: 300, // 5 min
  video: 600, // 10 min
  videoLikes: 120, // 2 min
} as const;

/**
 * Refresh token cookie configuration.
 * Scoped to /auth (not /auth/refresh) so the cookie is also sent to
 * /auth/logout for token revocation.
 */
export const REFRESH_COOKIE_NAME = "refreshToken";
export const REFRESH_COOKIE_PATH = "/auth";
