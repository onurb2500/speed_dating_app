export type VideoStatus = "PROCESSING" | "READY" | "FAILED";

/** Video entity (no framework dependencies). */
export interface Video {
  id: string;
  userId: string;
  muxUploadId: string | null;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  duration: number;
  status: VideoStatus;
  confirmedAt: Date | null;
  createdAt: Date;
}
