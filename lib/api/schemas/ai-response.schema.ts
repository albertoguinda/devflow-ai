import { z } from "zod";

/**
 * Response validation schemas for AI route handlers.
 * These sanitize parsed AI responses before sending to the client,
 * stripping unexpected fields, coercing types, and capping string lengths.
 */

const aiReviewIssueSchema = z.object({
  line: z.number().default(0),
  severity: z.enum(["critical", "warning", "info"]).default("info"),
  category: z.string().max(200).default(""),
  message: z.string().max(2000).default(""),
  suggestion: z.string().max(2000).default(""),
});

export const aiReviewResponseSchema = z.object({
  issues: z.array(aiReviewIssueSchema).default([]),
  score: z.number().min(0).max(100).default(50),
  suggestions: z.array(z.string().max(2000)).default([]),
  refactoredCode: z.string().max(100_000).default(""),
});

const aiSuggestionSchema = z.object({
  value: z.string().max(5000).default(""),
  score: z.number().default(0),
  reasoning: z.string().max(2000).default(""),
});

export const aiSuggestResponseSchema = z.object({
  suggestions: z.array(aiSuggestionSchema).default([]),
});

export const aiRefineResponseSchema = z.object({
  refinedPrompt: z.string().max(15_000).default(""),
  changelog: z.array(z.string().max(2000)).default([]),
  score: z.number().min(0).max(100).default(50),
});
