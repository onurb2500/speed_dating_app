import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { env } from "@/config/env";

const SALT_ROUNDS = 12;

/** Hash a plaintext password with bcrypt. */
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/** Compare a plaintext password against a bcrypt hash. */
export function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Generate a cryptographically-random opaque refresh token (raw value). */
export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

/**
 * Derive the stored hash of a refresh token. We store the HMAC, never the
 * raw token, so a DB leak does not expose usable tokens.
 */
export function hashRefreshToken(rawToken: string): string {
  return crypto
    .createHmac("sha256", env.REFRESH_TOKEN_SECRET)
    .update(rawToken)
    .digest("hex");
}
