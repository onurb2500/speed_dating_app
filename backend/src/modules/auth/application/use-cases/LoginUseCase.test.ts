import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginUseCase } from "@/modules/auth/application/use-cases/LoginUseCase";
import { IAuthUserRepository } from "@/modules/auth/domain/repositories/IAuthUserRepository";
import { IRefreshTokenRepository } from "@/modules/auth/domain/repositories/IRefreshTokenRepository";
import { InvalidCredentialsError } from "@/shared/errors";
import { hashPassword } from "@/shared/utils/hash";

function makeTokenRepo(): IRefreshTokenRepository {
  return {
    create: vi.fn().mockResolvedValue({
      id: "rt-1",
      tokenHash: "hash",
      userId: "user-1",
      expiresAt: new Date(),
      revoked: false,
    }),
    findByHash: vi.fn(),
    revoke: vi.fn(),
    revokeAllForUser: vi.fn(),
  };
}

describe("LoginUseCase", () => {
  let users: IAuthUserRepository;
  let tokens: IRefreshTokenRepository;
  let useCase: LoginUseCase;
  let passwordHash: string;

  beforeEach(async () => {
    passwordHash = await hashPassword("password123");
    users = {
      findByEmail: vi.fn().mockResolvedValue({
        id: "user-1",
        email: "user@example.com",
        displayName: "User",
        passwordHash,
      }),
      findById: vi.fn(),
      emailExists: vi.fn(),
      create: vi.fn(),
    };
    tokens = makeTokenRepo();
    useCase = new LoginUseCase(users, tokens);
  });

  it("logs in with valid credentials", async () => {
    const result = await useCase.execute({
      email: "User@Example.com",
      password: "password123",
    });
    expect(users.findByEmail).toHaveBeenCalledWith("user@example.com");
    expect(result.accessToken).toBeTruthy();
    expect(result.user.id).toBe("user-1");
  });

  it("rejects an unknown email", async () => {
    (users.findByEmail as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(
      useCase.execute({ email: "nope@example.com", password: "password123" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("rejects a wrong password", async () => {
    await expect(
      useCase.execute({ email: "user@example.com", password: "wrongpass" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(tokens.create).not.toHaveBeenCalled();
  });
});
