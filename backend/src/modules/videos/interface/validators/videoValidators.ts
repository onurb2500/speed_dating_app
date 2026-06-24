import { z } from "zod";
import { MAX_VIDEO_DURATION } from "@/config/constants";

export const createUploadUrlSchema = z.object({
  durationSeconds: z
    .number()
    .positive()
    .max(MAX_VIDEO_DURATION, "Video exceeds the maximum duration"),
});

export const confirmUploadSchema = z.object({
  videoId: z.string().min(1),
});

export const videoIdParamsSchema = z.object({
  videoId: z.string().min(1),
});

export type CreateUploadUrlBody = z.infer<typeof createUploadUrlSchema>;
export type ConfirmUploadBody = z.infer<typeof confirmUploadSchema>;
