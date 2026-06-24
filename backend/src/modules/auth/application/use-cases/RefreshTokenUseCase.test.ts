import { describe, it, expect, vi, beforeEach } from "vitest";
import { RefreshTokenUseCase } from "@/modules/auth/application/use-cases/RefreshTokenUseCase";
import { LogoutUseCase } from "@/modules/auth/application/use-cases/LogoutUseCase";
import { IAuthUserRepository } from "@/modules/auth/domain/repositories/IAuthUserRepository";
import { IRefreshTokenRepository } from "@/modules/auth/domain/repositories/IRefreshTokenRepository";
import {
  InvalidRefreshTokenError,
  RefreshTokenExpiredError,
} from "@/shared/errors";
import { hashRefreshToken } from "@/shared/utils/hash";

const RAW = "raw-refresh-token";

function makeUserRepo(): IAuthUserRepository {
  return {
    findByEmail: vi.fn(),
    findById: vi.fn().mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      displayName: "User",
      passwordHash: "hash",
    }),
    emailExists: vi.fn(),
    create: vi.fn(),
  };
}

function makeTokenRepo(
  record: Record<string, unknown> | null,
): IRefreshTokenRepository {
  return {
    create: vi.fn().mockResolvedValue({
      id: "rt-new",
      tokenHash: "h",
      userId: "user-1",
      expiresAt: new Date(),
      revoked: false,
    }),
    findByHash: vi.fn().mockResolvedValue(record),
    revoke: vi.fn(),
    revokeAllForUser: vi.fn(),
  };
}

describe("RefreshTokenUseCase", () => {
  let users: IAuthUserRepository;

  beforeEach(() => {
    users = makeUserRepo();
  });

  it("rotates a valid refresh token", async () => {
    const tokens = makeTokenRepo({
      id: "rt-1",
      tokenHash: hashRefreshToken(RAW),
      userId: "user-1",
      expiresAt: new Date(Date.now() + 60_000),
      revoked: false,
    });
    const useCase = new RefreshTokenUseCase(users, tokens);

    const result = await useCase.execute(RAW);

    expect(tokens.findByHash).toHaveBeenCalledWith(hashRefreshToken(RAW));
    // Old token revoked, new token issued (rotation).
    expect(tokens.revoke).toHaveBeenCalledWith("rt-1");
    expect(tokens.create).toHaveBeenCalledOnce();
    expect(result.accessToken).toBeTruthy();
  });

  it("rejects a missing token", async () => {
    const tokens = makeTokenRepo(null);
    const useCase = new RefreshTokenUseCase(users, tokens);
    await expect(useCase.execute(undefined)).rejects.toBeInstanceOf(
      InvalidRefreshTokenError,
    );
  });

  it("rejects a revoked token", async () => {
    const tokens = makeTokenRepo({
      id: "rt-1",
      tokenHash: hashRefreshToken(RAW),
      userId: "user-1",
      expiresAt: new Date(Date.now() + 60_000),
      revoked: true,
    });
    const useCase = new RefreshTokenUseCase(users, tokens);
    await expect(useCase.execute(RAW)).rejects.toBeInstanceOf(
      InvalidRefreshTokenError,
    );
  });

  it("rejects and revokes an expired token", async () => {
    const tokens = makeTokenRepo({
      id: "rt-1",
      tokenHash: hashRefreshToken(RAW),
      userId: "user-1",
      expiresAt: new Date(Date.now() - 1000),
      revoked: false,
    });
    const useCase = new RefreshTokenUseCase(users, tokens);
    await expect(useCase.execute(RAW)).rejects.toBeInstanceOf(
      RefreshTokenExpiredError,
    );
    expect(tokens.revoke).toHaveBeenCalledWith("rt-1");
  });
});

describe("LogoutUseCase", () => {
  it("revokes a known token", async () => {
    const tokens = makeTokenRepo({
      id: "rt-1",
      tokenHash: hashRefreshToken(RAW),
      userId: "user-1",
      expiresAt: new Date(Date.now() + 60_000),
      revoked: false,
    });
    await new LogoutUseCase(tokens).execute(RAW);
    expect(tokens.revoke).toHaveBeenCalledWith("rt-1");
  });

  it("is a no-op without a token", async () => {
    const tokens = makeTokenRepo(null);
    await new LogoutUseCase(tokens).execute(undefined);
    expect(tokens.findByHash).not.toHaveBeenCalled();
  });
});
