import { IRefreshTokenRepository } from "@/modules/auth/domain/repositories/IRefreshTokenRepository";
import { AuthUserRecord } from "@/modules/auth/domain/entities/AuthToken";
import { SessionResult } from "@/modules/auth/application/dtos/AuthDtos";
import { signAccessToken } from "@/shared/utils/jwt";
import { generateRefreshToken, hashRefreshToken } from "@/shared/utils/hash";
import { REFRESH_TOKEN_TTL_DAYS } from "@/config/constants";

/**
 * Shared session-issuing logic used by register, login and refresh.
 * Signs an access token and persists a hashed refresh token.
 */
export async function issueSession(
  user: AuthUserRecord,
  refreshTokenRepo: IRefreshTokenRepository,
): Promise<SessionResult> {
  const accessToken = signAccessToken({ sub: user.id, email: user.email });

  const rawRefreshToken = generateRefreshToken();
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  await refreshTokenRepo.create({
    tokenHash: hashRefreshToken(rawRefreshToken),
    userId: user.id,
    expiresAt,
  });

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    refreshTokenExpiresAt: expiresAt,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    },
  };
}
