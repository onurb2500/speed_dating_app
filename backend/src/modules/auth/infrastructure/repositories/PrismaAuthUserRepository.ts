import { PrismaClient } from "@prisma/client";
import {
  IAuthUserRepository,
  CreateAuthUserInput,
} from "@/modules/auth/domain/repositories/IAuthUserRepository";
import { AuthUserRecord } from "@/modules/auth/domain/entities/AuthToken";

export class PrismaAuthUserRepository implements IAuthUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<AuthUserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user
      ? {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          passwordHash: user.passwordHash,
        }
      : null;
  }

  async findById(id: string): Promise<AuthUserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user
      ? {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          passwordHash: user.passwordHash,
        }
      : null;
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }

  async create(input: CreateAuthUserInput): Promise<AuthUserRecord> {
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        displayName: input.displayName,
      },
    });
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      passwordHash: user.passwordHash,
    };
  }
}
