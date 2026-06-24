import {
  FeedItem,
  FeedCandidate,
} from "@/modules/feed/domain/entities/FeedItem";

export interface IFeedRepository {
  /**
   * All READY videos eligible for `viewerId`, excluding their own, ordered
   * by createdAt DESC. Used to (re)build the cached feed pool.
   */
  listCandidates(viewerId: string): Promise<FeedCandidate[]>;

  /**
   * Hydrate the given video ids into full feed items for `viewerId`,
   * preserving the input order. Includes like/comment counts and `liked`.
   */
  hydrate(videoIds: string[], viewerId: string): Promise<FeedItem[]>;
}
