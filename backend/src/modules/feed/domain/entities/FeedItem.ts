export interface FeedItemAuthor {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

/** A single hydrated item in a user's feed. */
export interface FeedItem {
  videoId: string;
  playbackId: string;
  duration: number;
  user: FeedItemAuthor;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  createdAt: Date;
}

/** Lightweight candidate reference cached in the feed pool. */
export interface FeedCandidate {
  id: string;
  createdAt: string; // ISO — JSON-serialisable for Redis
}
