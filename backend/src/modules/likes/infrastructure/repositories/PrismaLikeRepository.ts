import { PrismaClient, Prisma } from "@prisma/client";
import { ILikeRepository } from "@/modules/likes/domain/repositories/ILikeRepository";

export class PrismaLikeRepository implements ILikeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async videoExists(videoId: string): Promise<boolean> {
    const count = await this.prisma.video.count({ where: { id: videoId } });
    return count > 0;
  }

  async add(userId: string, videoId: string): Promise<boolean> {
    try {
      await this.prisma.like.create({ data: { userId, videoId } });
      return true;
    } catch (err) {
      // Unique constraint → already liked: idempotent no-op.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        return false;
      }
      throw err;
    }
  }

  async remove(userId: string, videoId: string): Promise<boolean> {
    const result = await this.prisma.like.deleteMany({
      where: { userId, videoId },
    });
    return result.count > 0;
  }

  async countForVideo(videoId: string): Promise<number> {
    return this.prisma.like.count({ where: { videoId } });
  }

  async exists(userId: string, videoId: string): Promise<boolean> {
    const count = await this.prisma.like.count({
      where: { userId, videoId },
    });
    return count > 0;
  }
}
