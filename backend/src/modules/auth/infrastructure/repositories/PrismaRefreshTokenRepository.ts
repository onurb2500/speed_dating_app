import { PrismaClient } from "@prisma/client";
import {
  IRefreshTokenRepository,
  CreateRefreshTokenInput,
} from "@/modules/auth/domain/repositories/IRefreshTokenRepository";
import { RefreshTokenRecord } from "@/modules/auth/domain/entities/AuthToken";

export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateRefreshTokenInput): Promise<RefreshTokenRecord> {
    const row = await this.prisma.refreshToken.create({
      data: {
        token: input.tokenHash,
        userId: input.userId,
        expiresAt: input.expiresAt,
      },
    });
    return this.toRecord(row);
  }

  async findByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const row = await this.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
    });
    return row ? this.toRecord(row) : null;
  }

  async revoke(id: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  private toRecord(row: {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    revoked: boolean;
  }): RefreshTokenRecord {
    return {
      id: row.id,
      tokenHash: row.token,
      userId: row.userId,
      expiresAt: row.expiresAt,
      revoked: row.revoked,
    };
  }
}
