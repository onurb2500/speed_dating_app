import rateLimit, { Options } from "express-rate-limit";
import { Request } from "express";

const FIFTEEN_MIN = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

/** Prefer the authenticated user id; fall back to IP. */
function userOrIpKey(req: Request): string {
  return req.user?.id ?? req.ip ?? "unknown";
}

const base: Partial<Options> = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMIT", message: "Too many requests" } },
};

/** 100 req / 15min — applied globally to authenticated traffic. */
export const generalLimiter = rateLimit({
  ...base,
  windowMs: FIFTEEN_MIN,
  limit: 100,
  keyGenerator: userOrIpKey,
});

/** 60 req / 15min per IP — for unauthenticated/public endpoints. */
export const publicLimiter = rateLimit({
  ...base,
  windowMs: FIFTEEN_MIN,
  limit: 60,
});

/** 10 req / 15min per IP — login. */
export const loginLimiter = rateLimit({
  ...base,
  windowMs: FIFTEEN_MIN,
  limit: 10,
});

/** 5 req / 15min per IP — register. */
export const registerLimiter = rateLimit({
  ...base,
  windowMs: FIFTEEN_MIN,
  limit: 5,
});

/** 20 req / hour per user — request upload URLs. */
export const uploadUrlLimiter = rateLimit({
  ...base,
  windowMs: ONE_HOUR,
  limit: 20,
  keyGenerator: userOrIpKey,
});

/** 30 req / 15min per user — posting comments. */
export const commentLimiter = rateLimit({
  ...base,
  windowMs: FIFTEEN_MIN,
  limit: 30,
  keyGenerator: userOrIpKey,
});
