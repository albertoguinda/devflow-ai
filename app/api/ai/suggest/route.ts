import { NextRequest } from "next/server";
import type { AISuggestResult } from "@/types/ai";
import { aiSuggestSchema, aiSuggestResponseSchema } from "@/lib/api/schemas";
import {
  extractBYOK,
  withRateLimit,
  validateBody,
  successResponse,
  errorResponse,
  getClientIP,
} from "@/lib/api/middleware";
import { createAIProvider } from "@/infrastructure/external/ai-provider-factory";
import { getRateLimiter } from "@/infrastructure/services/rate-limiter";
import { getServerEnv } from "@/infrastructure/config/env";
import {
  SUGGEST_VARIABLE_NAME_SYSTEM_PROMPT,
  SUGGEST_REGEX_SYSTEM_PROMPT,
  SUGGEST_COMMIT_MESSAGE_SYSTEM_PROMPT,
  SUGGEST_CRON_SYSTEM_PROMPT,
  SUGGEST_JSON_EXPLAIN_SYSTEM_PROMPT,
  SUGGEST_BASE64_EXPLAIN_SYSTEM_PROMPT,
  SUGGEST_DTO_OPTIMIZE_SYSTEM_PROMPT,
  SUGGEST_HTTP_EXPLAIN_SYSTEM_PROMPT,
  SUGGEST_TAILWIND_OPTIMIZE_SYSTEM_PROMPT,
  SUGGEST_COST_ADVISE_SYSTEM_PROMPT,
  SUGGEST_CONTEXT_OPTIMIZE_SYSTEM_PROMPT,
} from "@/lib/api/prompts";

/** Wrap user-supplied content in delimiters to reduce prompt injection risk. */
function delimit(content: string): string {
  return `<user_input>\n${content}\n</user_input>`;
}

function localeHint(locale?: string): string {
  if (locale === "es") return "[IMPORTANT: Respond entirely in Spanish (es-ES).]\n\n";
  return "";
}

function getPromptForMode(mode: string, context: string, type?: string, language?: string, locale?: string): { systemPrompt: string; userPrompt: string } {
  const safe = delimit(context);
  const hint = localeHint(locale);
  switch (mode) {
    case "regex-generate":
      return { systemPrompt: SUGGEST_REGEX_SYSTEM_PROMPT, userPrompt: `${hint}Generate a regex for the following user input:\n${safe}` };
    case "commit-message":
      return { systemPrompt: SUGGEST_COMMIT_MESSAGE_SYSTEM_PROMPT, userPrompt: `${hint}Generate commit messages for these changes:\n${safe}` };
    case "cron-generate":
      return { systemPrompt: SUGGEST_CRON_SYSTEM_PROMPT, userPrompt: `${hint}Generate a cron expression for:\n${safe}` };
    case "json-explain":
      return { systemPrompt: SUGGEST_JSON_EXPLAIN_SYSTEM_PROMPT, userPrompt: `${hint}Analyze this JSON structure:\n${safe}` };
    case "base64-explain":
      return { systemPrompt: SUGGEST_BASE64_EXPLAIN_SYSTEM_PROMPT, userPrompt: `${hint}Analyze this decoded/encoded content:\n${safe}` };
    case "dto-optimize":
      return { systemPrompt: SUGGEST_DTO_OPTIMIZE_SYSTEM_PROMPT, userPrompt: `${hint}Suggest improvements for this generated code:\n${safe}` };
    case "http-explain":
      return { systemPrompt: SUGGEST_HTTP_EXPLAIN_SYSTEM_PROMPT, userPrompt: `${hint}Explain this HTTP status code and provide guidance:\n${safe}` };
    case "tailwind-optimize":
      return { systemPrompt: SUGGEST_TAILWIND_OPTIMIZE_SYSTEM_PROMPT, userPrompt: `${hint}Optimize these Tailwind CSS classes:\n${safe}` };
    case "cost-advise":
      return { systemPrompt: SUGGEST_COST_ADVISE_SYSTEM_PROMPT, userPrompt: `${hint}Provide cost optimization advice for this scenario:\n${safe}` };
    case "context-optimize":
      return { systemPrompt: SUGGEST_CONTEXT_OPTIMIZE_SYSTEM_PROMPT, userPrompt: `${hint}Analyze this context window and suggest optimizations:\n${safe}` };
    default:
      return { systemPrompt: SUGGEST_VARIABLE_NAME_SYSTEM_PROMPT, userPrompt: `${hint}Suggest names for a ${type ?? "variable"} in ${language ?? "typescript"}:\n${safe}` };
  }
}

export async function POST(request: NextRequest) {
  const byok = extractBYOK(request);
  const isByok = Boolean(byok);

  const rateLimited = withRateLimit(request, isByok);
  if (rateLimited) return rateLimited;

  const parsed = await validateBody(request, aiSuggestSchema);
  if ("error" in parsed) return parsed.error;
  const { context, type, language, mode, locale } = parsed.data;

  const provider = createAIProvider(byok);
  if (!provider) {
    return errorResponse("AI is not configured on this server", 503);
  }

  const { systemPrompt, userPrompt } = getPromptForMode(mode, context, type, language, locale);

  try {
    const response = await provider.generateText(userPrompt, systemPrompt);

    const result = parseSuggestResponse(response.text);

    // Record token usage (request already recorded by withRateLimit)
    const env = getServerEnv();
    const limiter = getRateLimiter(env.RATE_LIMIT_RPM, env.RATE_LIMIT_DAILY_TOKENS);
    const ip = getClientIP(request);
    limiter.recordTokens(ip, response.usage.totalTokens);

    return successResponse(result);
  } catch (error) {
    console.error("[suggest] AI call failed:", error instanceof Error ? error.message : "Unknown error");
    return errorResponse("AI request failed. Please try again.", 502);
  }
}

function parseSuggestResponse(text: string): AISuggestResult {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  let raw: unknown;
  try {
    raw = JSON.parse(cleaned);
  } catch {
    console.error("[suggest] AI returned malformed JSON (length:", cleaned.length, ")");
    throw new Error("AI returned an unexpected response format");
  }

  const validated = aiSuggestResponseSchema.safeParse(raw);
  if (!validated.success) {
    console.error("[suggest] AI response failed validation:", validated.error.message);
    return { suggestions: [] };
  }

  return validated.data;
}
