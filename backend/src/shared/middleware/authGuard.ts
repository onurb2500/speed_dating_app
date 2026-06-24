import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/shared/utils/jwt";
import { UnauthorizedError } from "@/shared/errors";

/** Authenticated user attached to the request by `authGuard`. */
export interface AuthUser {
  id: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Verifies the Bearer access token and attaches `req.user`.
 * Every protected route must use this middleware.
 */
export function authGuard(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Missing access token"));
  }
  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired access token"));
  }
}

/** Narrow helper for controllers: asserts and returns the authed user. */
export function requireUser(req: Request): AuthUser {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return req.user;
}
