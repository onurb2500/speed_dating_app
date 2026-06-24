import { PrismaClient } from "@prisma/client";
import { IFeedRepository } from "@/modules/feed/domain/repositories/IFeedRepository";
import {
  FeedItem,
  FeedCandidate,
} from "@/modules/feed/domain/entities/FeedItem";

export class PrismaFeedRepository implements IFeedRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listCandidates(viewerId: string): Promise<FeedCandidate[]> {
    const rows = await this.prisma.video.findMany({
      where: { status: "READY", userId: { not: viewerId } },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true },
    });
    return rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async hydrate(videoIds: string[], viewerId: string): Promise<FeedItem[]> {
    if (videoIds.length === 0) return [];

    const rows = await this.prisma.video.findMany({
      where: { id: { in: videoIds } },
      select: {
        id: true,
        duration: true,
        muxPlaybackId: true,
        createdAt: true,
        user: { select: { id: true, displayName: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId: viewerId }, select: { id: true }, take: 1 },
      },
    });

    // Preserve the requested order (Prisma `in` does not guarantee it).
    const byId = new Map(rows.map((r) => [r.id, r]));
    const items: FeedItem[] = [];
    for (const id of videoIds) {
      const r = byId.get(id);
      if (!r || !r.muxPlaybackId) continue;
      items.push({
        videoId: r.id,
        playbackId: r.muxPlaybackId,
        duration: r.duration,
        user: {
          id: r.user.id,
          displayName: r.user.displayName,
          avatarUrl: r.user.avatarUrl,
        },
        likeCount: r._count.likes,
        commentCount: r._count.comments,
        liked: r.likes.length > 0,
        createdAt: r.createdAt,
      });
    }
    return items;
  }
}
