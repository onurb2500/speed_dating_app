import { IAuthUserRepository } from "@/modules/auth/domain/repositories/IAuthUserRepository";
import { IRefreshTokenRepository } from "@/modules/auth/domain/repositories/IRefreshTokenRepository";
import {
  RegisterInput,
  SessionResult,
} from "@/modules/auth/application/dtos/AuthDtos";
import { issueSession } from "@/modules/auth/application/services/issueSession";
import { hashPassword } from "@/shared/utils/hash";
import { EmailTakenError } from "@/shared/errors";

export class RegisterUserUseCase {
  constructor(
    private readonly users: IAuthUserRepository,
    private readonly refreshTokens: IRefreshTokenRepository,
  ) {}

  async execute(input: RegisterInput): Promise<SessionResult> {
    const email = input.email.toLowerCase().trim();

    if (await this.users.emailExists(email)) {
      throw new EmailTakenError();
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.users.create({
      email,
      passwordHash,
      displayName: input.displayName.trim(),
    });

    return issueSession(user, this.refreshTokens);
  }
}
