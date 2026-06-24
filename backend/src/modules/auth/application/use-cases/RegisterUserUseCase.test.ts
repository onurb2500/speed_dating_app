import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterUserUseCase } from "@/modules/auth/application/use-cases/RegisterUserUseCase";
import { IAuthUserRepository } from "@/modules/auth/domain/repositories/IAuthUserRepository";
import { IRefreshTokenRepository } from "@/modules/auth/domain/repositories/IRefreshTokenRepository";
import { EmailTakenError } from "@/shared/errors";

function makeUserRepo(): IAuthUserRepository {
  return {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    emailExists: vi.fn().mockResolvedValue(false),
    create: vi.fn().mockImplementation(async (input) => ({
      id: "user-1",
      email: input.email,
      displayName: input.displayName,
      passwordHash: input.passwordHash,
    })),
  };
}

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

describe("RegisterUserUseCase", () => {
  let users: IAuthUserRepository;
  let tokens: IRefreshTokenRepository;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    users = makeUserRepo();
    tokens = makeTokenRepo();
    useCase = new RegisterUserUseCase(users, tokens);
  });

  it("registers a new user and returns a session", async () => {
    const result = await useCase.execute({
      email: "New@Example.com",
      password: "password123",
      displayName: " Marina ",
    });

    expect(users.emailExists).toHaveBeenCalledWith("new@example.com");
    expect(users.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "new@example.com",
        displayName: "Marina",
      }),
    );
    // Password must be hashed, never stored in plaintext.
    const createArg = (users.create as ReturnType<typeof vi.fn>).mock
      .calls[0][0];
    expect(createArg.passwordHash).not.toBe("password123");
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.user).toEqual({
      id: "user-1",
      email: "new@example.com",
      displayName: "Marina",
    });
  });

  it("throws EmailTakenError when the email already exists", async () => {
    (users.emailExists as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    await expect(
      useCase.execute({
        email: "taken@example.com",
        password: "password123",
        displayName: "Taken",
      }),
    ).rejects.toBeInstanceOf(EmailTakenError);
    expect(users.create).not.toHaveBeenCalled();
  });
});
