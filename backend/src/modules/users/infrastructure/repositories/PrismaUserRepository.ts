import { PrismaClient, Prisma } from "@prisma/client";
import {
  IUserRepository,
  UpdateUserInput,
} from "@/modules/users/domain/repositories/IUserRepository";
import { User, SavedPrompt } from "@/modules/users/domain/entities/User";

type UserRow = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  savedPrompts: Prisma.JsonValue;
  createdAt: Date;
};

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const data: Prisma.UserUpdateInput = {};
    if (input.displayName !== undefined) data.displayName = input.displayName;
    if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
    if (input.savedPrompts !== undefined) {
      data.savedPrompts = input.savedPrompts as unknown as Prisma.InputJsonValue;
    }
    const row = await this.prisma.user.update({ where: { id }, data });
    return this.toEntity(row);
  }

  private toEntity(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      displayName: row.displayName,
      avatarUrl: row.avatarUrl,
      savedPrompts: (row.savedPrompts as SavedPrompt[] | null) ?? null,
      createdAt: row.createdAt,
    };
  }
}
