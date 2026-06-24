import { describe, it, expect, vi } from "vitest";
import { GetUserProfileUseCase } from "@/modules/users/application/use-cases/GetUserProfileUseCase";
import { UpdateUserProfileUseCase } from "@/modules/users/application/use-cases/UpdateUserProfileUseCase";
import { IUserRepository } from "@/modules/users/domain/repositories/IUserRepository";
import { User } from "@/modules/users/domain/entities/User";
import { NotFoundError } from "@/shared/errors";

function user(): User {
  return {
    id: "user-1",
    email: "user@example.com",
    displayName: "User",
    avatarUrl: null,
    savedPrompts: null,
    createdAt: new Date(),
  };
}

function makeRepo(): IUserRepository {
  return {
    findById: vi.fn().mockResolvedValue(user()),
    update: vi.fn().mockResolvedValue({ ...user(), displayName: "Updated" }),
  };
}

describe("GetUserProfileUseCase", () => {
  it("returns the profile", async () => {
    const repo = makeRepo();
    const result = await new GetUserProfileUseCase(repo).execute("user-1");
    expect(result.id).toBe("user-1");
  });

  it("throws when not found", async () => {
    const repo = makeRepo();
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(
      new GetUserProfileUseCase(repo).execute("x"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("UpdateUserProfileUseCase", () => {
  it("updates an existing profile", async () => {
    const repo = makeRepo();
    const result = await new UpdateUserProfileUseCase(repo).execute("user-1", {
      displayName: "Updated",
    });
    expect(repo.update).toHaveBeenCalledWith("user-1", {
      displayName: "Updated",
    });
    expect(result.displayName).toBe("Updated");
  });

  it("throws when updating a missing user", async () => {
    const repo = makeRepo();
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(
      new UpdateUserProfileUseCase(repo).execute("x", { displayName: "Y" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
