import { Request, Response } from "express";
import { GetFeedUseCase } from "@/modules/feed/application/use-cases/GetFeedUseCase";
import { FeedItem } from "@/modules/feed/domain/entities/FeedItem";
import { requireUser } from "@/shared/middleware/authGuard";

function toResponse(item: FeedItem) {
  return {
    videoId: item.videoId,
    playbackId: item.playbackId,
    duration: item.duration,
    user: item.user,
    likeCount: item.likeCount,
    commentCount: item.commentCount,
    liked: item.liked,
    createdAt: item.createdAt,
  };
}

/** Parse the `X-Seen-Videos: id1,id2,...` header into a list of ids. */
function parseSeen(header: string | undefined): string[] {
  if (!header) return [];
  return header
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 500); // safety cap
}

export class FeedController {
  constructor(private readonly getFeed: GetFeedUseCase) {}

  getFeedHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req);
    const result = await this.getFeed.execute({
      viewerId: id,
      cursor: req.query.cursor as string | undefined,
      limit: Number(req.query.limit),
      seenVideoIds: parseSeen(req.header("x-seen-videos")),
    });
    res.json({
      items: result.items.map(toResponse),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  };
}
