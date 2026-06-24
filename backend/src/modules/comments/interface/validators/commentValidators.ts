import { z } from "zod";
import {
  COMMENT_MIN_LENGTH,
  COMMENT_MAX_LENGTH,
  COMMENTS_PAGE_DEFAULT,
  COMMENTS_PAGE_MAX,
} from "@/config/constants";

export const postCommentSchema = z.object({
  text: z.string().min(COMMENT_MIN_LENGTH).max(COMMENT_MAX_LENGTH),
});

export const listCommentsQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(COMMENTS_PAGE_MAX)
    .default(COMMENTS_PAGE_DEFAULT),
});

export const commentParamsSchema = z.object({
  videoId: z.string().min(1),
});

export const commentDeleteParamsSchema = z.object({
  videoId: z.string().min(1),
  commentId: z.string().min(1),
});
