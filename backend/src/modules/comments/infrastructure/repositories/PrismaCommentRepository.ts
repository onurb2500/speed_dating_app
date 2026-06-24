import { PrismaClient } from "@prisma/client";
import {
  ICommentRepository,
  CreateCommentInput,
  ListCommentsInput,
} from "@/modules/comments/domain/repositories/ICommentRepository";
import { Comment } from "@/modules/comments/domain/entities/Comment";

const authorSelect = {
  id: true,
  text: true,
  videoId: true,
  createdAt: true,
  user: { select: { id: true, displayName: true, avatarUrl: true } },
} as const;

type CommentRow = {
  id: string;
  text: string;
  videoId: string;
  createdAt: Date;
  user: { id: string; displayName: string; avatarUrl: string | null };
};

export class PrismaCommentRepository implements ICommentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async videoExists(videoId: string): Promise<boolean> {
    const count = await this.prisma.video.count({ where: { id: videoId } });
    return count > 0;
  }

  async create(input: CreateCommentInput): Promise<Comment> {
    const row = await this.prisma.comment.create({
      data: {
        userId: input.userId,
        videoId: input.videoId,
        text: input.text,
      },
      select: authorSelect,
    });
    return this.toEntity(row);
  }

  async list(input: ListCommentsInput): Promise<Comment[]> {
    const rows = await this.prisma.comment.findMany({
      where: { videoId: input.videoId },
      orderBy: { createdAt: "desc" },
      take: input.limit,
      ...(input.cursor
        ? { cursor: { id: input.cursor }, skip: 1 }
        : {}),
      select: authorSelect,
    });
    return rows.map((r) => this.toEntity(r));
  }

  async findById(
    id: string,
  ): Promise<{ id: string; userId: string } | null> {
    const row = await this.prisma.comment.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    return row ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id } });
  }

  private toEntity(row: CommentRow): Comment {
    return {
      id: row.id,
      videoId: row.videoId,
      text: row.text,
      author: {
        id: row.user.id,
        displayName: row.user.displayName,
        avatarUrl: row.user.avatarUrl,
      },
      createdAt: row.createdAt,
    };
  }
}
