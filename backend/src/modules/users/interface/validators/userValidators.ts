import { z } from "zod";

const savedPromptSchema = z.object({
  id: z.number().int().nonnegative(),
  text: z.string().min(1).max(500),
});

export const updateUserSchema = z
  .object({
    displayName: z.string().min(1).max(60).optional(),
    avatarUrl: z.string().url().max(2048).nullable().optional(),
    savedPrompts: z.array(savedPromptSchema).max(20).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateUserBody = z.infer<typeof updateUserSchema>;
