import { IAuthUserRepository } from "@/modules/auth/domain/repositories/IAuthUserRepository";
import { IRefreshTokenRepository } from "@/modules/auth/domain/repositories/IRefreshTokenRepository";
import {
  LoginInput,
  SessionResult,
} from "@/modules/auth/application/dtos/AuthDtos";
import { issueSession } from "@/modules/auth/application/services/issueSession";
import { verifyPassword } from "@/shared/utils/hash";
import { InvalidCredentialsError } from "@/shared/errors";

export class LoginUseCase {
  constructor(
    private readonly users: IAuthUserRepository,
    private readonly refreshTokens: IRefreshTokenRepository,
  ) {}

  async execute(input: LoginInput): Promise<SessionResult> {
    const email = input.email.toLowerCase().trim();
    const user = await this.users.findByEmail(email);

    // Always run a comparison to reduce timing side-channels, but a missing
    // user still results in InvalidCredentials.
    const ok = user
      ? await verifyPassword(input.password, user.passwordHash)
      : false;

    if (!user || !ok) {
      throw new InvalidCredentialsError();
    }

    return issueSession(user, this.refreshTokens);
  }
}
