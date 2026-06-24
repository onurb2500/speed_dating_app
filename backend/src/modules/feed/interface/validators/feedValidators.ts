import { z } from "zod";
import { FEED_PAGE_DEFAULT, FEED_PAGE_MAX } from "@/config/constants";

export const feedQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(FEED_PAGE_MAX)
    .default(FEED_PAGE_DEFAULT),
});
