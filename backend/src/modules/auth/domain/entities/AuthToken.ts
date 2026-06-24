/**
 * Domain representation of a persisted refresh token.
 * No framework/ORM dependencies.
 */
export interface RefreshTokenRecord {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  revoked: boolean;
}

/** Minimal user projection the auth module needs for credentials. */
export interface AuthUserRecord {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
}
