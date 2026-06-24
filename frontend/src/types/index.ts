export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  savedPrompts?: SavedPrompt[] | null;
  createdAt?: string;
}

export interface SavedPrompt {
  id: number;
  text: string;
}

export type VideoStatus = "PROCESSING" | "READY" | "FAILED";

export interface VideoStatusResponse {
  videoId: string;
  status: VideoStatus;
  playbackId: string | null;
  duration: number;
}

export interface FeedItemUser {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
}

export interface FeedItem {
  videoId: string;
  playbackId: string;
  duration: number;
  user: FeedItemUser;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  createdAt: string;
}

export interface FeedResponse {
  items: FeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface Comment {
  id: string;
  text: string;
  user: FeedItemUser;
  createdAt: string;
}

export interface CommentsResponse {
  items: Comment[];
  nextCursor: string | null;
  hasMore: boolean;
}

/** Recording state machine phases. */
export type RecordingPhase =
  | "idle"
  | "customizing"
  | "preparing"
  | "countdown"
  | "recording"
  | "preview"
  | "uploading"
  | "done";

/** A prompt shown during recording, with editable fill-in tokens. */
export interface PromptToken {
  placeholder: string;
  value: string;
  suggestions: string[];
}

export interface Prompt {
  id: number;
  /** Full sentence with `[token]` markers. */
  baseText: string;
  tokens: PromptToken[];
  /** When this prompt becomes active during recording (seconds). */
  startTime: number;
  poseHint: string;
  toneHint: string;
  toneBadgeIcon: string;
}

/** Camera filter identifiers. */
export type CameraFilter =
  | "natural"
  | "vintage"
  | "vivid"
  | "bw"
  | "warm";

export interface EmojiSticker {
  id: string;
  emoji: string;
  x: number; // 0..1 relative position
  y: number;
}
