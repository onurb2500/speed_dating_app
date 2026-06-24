import { IFeedRepository } from "@/modules/feed/domain/repositories/IFeedRepository";
import {
  FeedItem,
  FeedCandidate,
} from "@/modules/feed/domain/entities/FeedItem";
import { ICacheService } from "@/shared/cache/ICacheService";
import { CacheKeys, CacheTTL } from "@/config/constants";

export interface GetFeedInput {
  viewerId: string;
  cursor?: string;
  limit: number;
  seenVideoIds: string[];
}

export interface FeedResult {
  items: FeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * v1 feed: recency-based (newest first), de-duplicated per session.
 *
 * 1. Load the ordered candidate pool (cached in Redis, 5min TTL).
 * 2. Drop videos already seen this session and everything up to the cursor.
 * 3. Hydrate the next page (limit + 1 to detect more).
 */
export class GetFeedUseCase {
  constructor(
    private readonly feed: IFeedRepository,
    private readonly cache: ICacheService,
  ) {}

  async execute(input: GetFeedInput): Promise<FeedResult> {
    const pool = await this.getPool(input.viewerId);

    const seen = new Set(input.seenVideoIds);
    let candidates = pool.filter((c) => !seen.has(c.id));

    if (input.cursor) {
      const idx = candidates.findIndex((c) => c.id === input.cursor);
      candidates = idx >= 0 ? candidates.slice(idx + 1) : candidates;
    }

    const pageIds = candidates.slice(0, input.limit + 1).map((c) => c.id);
    const hasMore = pageIds.length > input.limit;
    const visibleIds = hasMore ? pageIds.slice(0, input.limit) : pageIds;

    const items = await this.feed.hydrate(visibleIds, input.viewerId);
    const nextCursor =
      hasMore && items.length > 0 ? items[items.length - 1]!.videoId : null;

    return { items, nextCursor, hasMore };
  }

  private async getPool(viewerId: string): Promise<FeedCandidate[]> {
    const key = CacheKeys.feedPool(viewerId);
    const cached = await this.cache.get<FeedCandidate[]>(key);
    if (cached) return cached;

    const candidates = await this.feed.listCandidates(viewerId);
    await this.cache.set(key, candidates, CacheTTL.feedPool);
    return candidates;
  }
}
