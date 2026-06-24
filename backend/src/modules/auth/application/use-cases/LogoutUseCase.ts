import { IRefreshTokenRepository } from "@/modules/auth/domain/repositories/IRefreshTokenRepository";
import { hashRefreshToken } from "@/shared/utils/hash";

/**
 * Revokes the presented refresh token. Idempotent — an unknown or already
 * revoked token is treated as success (the client is logged out either way).
 */
export class LogoutUseCase {
  constructor(private readonly refreshTokens: IRefreshTokenRepository) {}

  async execute(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const record = await this.refreshTokens.findByHash(
      hashRefreshToken(rawToken),
    );
    if (record && !record.revoked) {
      await this.refreshTokens.revoke(record.id);
    }
  }
}
