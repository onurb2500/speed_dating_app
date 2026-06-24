import { RefreshTokenRecord } from "@/modules/auth/domain/entities/AuthToken";

export interface CreateRefreshTokenInput {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}

export interface IRefreshTokenRepository {
  create(input: CreateRefreshTokenInput): Promise<RefreshTokenRecord>;
  findByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  revoke(id: string): Promise<void>;
  /** Revoke every active token for a user (logout-all / safety). */
  revokeAllForUser(userId: string): Promise<void>;
}
