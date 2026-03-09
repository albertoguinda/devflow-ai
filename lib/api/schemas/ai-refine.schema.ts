import { z } from "zod";

export const aiRefineSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt is required")
    .max(10_000, "Prompt must be under 10,000 characters"),
  goal: z.enum(["clarity", "specificity", "conciseness"]),
  locale: z.enum(["en", "es", "fr", "pt", "de", "it", "zh", "ja"]).optional(),
});

export type AIRefineInput = z.infer<typeof aiRefineSchema>;
