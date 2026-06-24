import { PrismaClient, VideoStatus as PrismaVideoStatus } from "@prisma/client";
import {
  IVideoRepository,
  CreateVideoInput,
} from "@/modules/videos/domain/repositories/IVideoRepository";
import { Video } from "@/modules/videos/domain/entities/Video";

type VideoRow = {
  id: string;
  userId: string;
  muxUploadId: string | null;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  duration: number;
  status: PrismaVideoStatus;
  confirmedAt: Date | null;
  createdAt: Date;
};

export class PrismaVideoRepository implements IVideoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateVideoInput): Promise<Video> {
    const row = await this.prisma.video.create({
      data: {
        userId: input.userId,
        duration: input.duration,
        muxUploadId: input.muxUploadId,
        status: "PROCESSING",
      },
    });
    return this.toEntity(row);
  }

  async findById(id: string): Promise<Video | null> {
    const row = await this.prisma.video.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findByMuxUploadId(uploadId: string): Promise<Video | null> {
    const row = await this.prisma.video.findUnique({
      where: { muxUploadId: uploadId },
    });
    return row ? this.toEntity(row) : null;
  }

  async findByMuxAssetId(assetId: string): Promise<Video | null> {
    const row = await this.prisma.video.findUnique({
      where: { muxAssetId: assetId },
    });
    return row ? this.toEntity(row) : null;
  }

  async attachAsset(id: string, muxAssetId: string): Promise<void> {
    await this.prisma.video.update({ where: { id }, data: { muxAssetId } });
  }

  async markReady(
    id: string,
    data: { muxAssetId: string; muxPlaybackId: string; duration?: number },
  ): Promise<void> {
    await this.prisma.video.update({
      where: { id },
      data: {
        status: "READY",
        muxAssetId: data.muxAssetId,
        muxPlaybackId: data.muxPlaybackId,
        ...(data.duration !== undefined ? { duration: data.duration } : {}),
      },
    });
  }

  async markFailed(id: string): Promise<void> {
    await this.prisma.video.update({
      where: { id },
      data: { status: "FAILED" },
    });
  }

  async markConfirmed(id: string): Promise<void> {
    await this.prisma.video.update({
      where: { id },
      data: { confirmedAt: new Date() },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.video.delete({ where: { id } });
  }

  private toEntity(row: VideoRow): Video {
    return {
      id: row.id,
      userId: row.userId,
      muxUploadId: row.muxUploadId,
      muxAssetId: row.muxAssetId,
      muxPlaybackId: row.muxPlaybackId,
      duration: row.duration,
      status: row.status,
      confirmedAt: row.confirmedAt,
      createdAt: row.createdAt,
    };
  }
}
