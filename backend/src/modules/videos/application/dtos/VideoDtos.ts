import { VideoStatus } from "@/modules/videos/domain/entities/Video";

export interface CreateUploadUrlResult {
  videoId: string;
  uploadUrl: string;
  expiresAt: Date;
}

export interface VideoStatusResult {
  videoId: string;
  status: VideoStatus;
  playbackId: string | null;
  duration: number;
}
