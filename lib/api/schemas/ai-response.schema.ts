import { z } from "zod";

/**
 * Response validation schemas for AI route handlers.
 * These sanitize parsed AI responses before sending to the client,
 * stripping unexpected fields and coercing types.
 */

const aiReviewIssueSchema = z.object({
  line: z.number().default(0),
  severity: z.enum(["critical", "warning", "info"]).default("info"),
  category: z.string().default(""),
  message: z.string().default(""),
  suggestion: z.string().default(""),
});

export const aiReviewResponseSchema = z.object({
  issues: z.array(aiReviewIssueSchema).default([]),
  score: z.number().min(0).max(100).default(50),
  suggestions: z.array(z.string()).default([]),
  refactoredCode: z.string().default(""),
});

const aiSuggestionSchema = z.object({
  value: z.string().default(""),
  score: z.number().default(0),
  reasoning: z.string().default(""),
});

export const aiSuggestResponseSchema = z.object({
  suggestions: z.array(aiSuggestionSchema).default([]),
});

export const aiRefineResponseSchema = z.object({
  refinedPrompt: z.string().default(""),
  changelog: z.array(z.string()).default([]),
  score: z.number().min(0).max(100).default(50),
});
