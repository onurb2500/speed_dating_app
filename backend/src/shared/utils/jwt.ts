import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { ACCESS_TOKEN_TTL } from "@/config/constants";

export interface AccessTokenPayload {
  sub: string; // userId
  email: string;
}

/** Sign a short-lived RS256 access token. */
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

/** Verify an access token signature + expiry. Throws on failure. */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_PUBLIC_KEY, {
    algorithms: ["RS256"],
  });
  if (typeof decoded === "string" || !decoded.sub) {
    throw new Error("Malformed token payload");
  }
  return { sub: String(decoded.sub), email: String(decoded.email) };
}
