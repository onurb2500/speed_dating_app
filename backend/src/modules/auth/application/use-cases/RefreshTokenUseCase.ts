import { IAuthUserRepository } from "@/modules/auth/domain/repositories/IAuthUserRepository";
import { IRefreshTokenRepository } from "@/modules/auth/domain/repositories/IRefreshTokenRepository";
import { SessionResult } from "@/modules/auth/application/dtos/AuthDtos";
import { issueSession } from "@/modules/auth/application/services/issueSession";
import { hashRefreshToken } from "@/shared/utils/hash";
import {
  InvalidRefreshTokenError,
  RefreshTokenExpiredError,
} from "@/shared/errors";

/**
 * Validates the incoming refresh token, rotates it (revokes old, issues new),
 * and returns a fresh session.
 */
export class RefreshTokenUseCase {
  constructor(
    private readonly users: IAuthUserRepository,
    private readonly refreshTokens: IRefreshTokenRepository,
  ) {}

  async execute(rawToken: string | undefined): Promise<SessionResult> {
    if (!rawToken) {
      throw new InvalidRefreshTokenError();
    }

    const record = await this.refreshTokens.findByHash(
      hashRefreshToken(rawToken),
    );
    if (!record || record.revoked) {
      throw new InvalidRefreshTokenError();
    }
    if (record.expiresAt.getTime() <= Date.now()) {
      await this.refreshTokens.revoke(record.id);
      throw new RefreshTokenExpiredError();
    }

    const user = await this.users.findById(record.userId);
    if (!user) {
      throw new InvalidRefreshTokenError();
    }

    // Rotation: revoke the consumed token before issuing a new one.
    await this.refreshTokens.revoke(record.id);

    return issueSession(user, this.refreshTokens);
  }
}
