import { NextRequest } from "next/server";
import type { AIReviewResult } from "@/types/ai";
import { aiReviewSchema, aiReviewResponseSchema } from "@/lib/api/schemas";
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
import { CODE_REVIEW_SYSTEM_PROMPT } from "@/lib/api/prompts";

export async function POST(request: NextRequest) {
  // 1. Extract BYOK
  const byok = extractBYOK(request);
  const isByok = Boolean(byok);

  // 2. Rate limit check
  const rateLimited = withRateLimit(request, isByok);
  if (rateLimited) return rateLimited;

  // 3. Validate body
  const parsed = await validateBody(request, aiReviewSchema);
  if ("error" in parsed) return parsed.error;
  const { code, language, locale } = parsed.data;

  // 4. Create provider
  const provider = createAIProvider(byok);
  if (!provider) {
    return errorResponse("AI is not configured on this server", 503);
  }

  // 5. Build prompt
  const localeHint = locale === "es" ? "[IMPORTANT: Respond entirely in Spanish (es-ES).]\n\n" : "";
  const userPrompt = `${localeHint}Language: ${language}\n\nCode:\n<user_input>\n\`\`\`${language}\n${code}\n\`\`\`\n</user_input>`;

  try {
    // 6. Call AI
    const response = await provider.generateText(
      userPrompt,
      CODE_REVIEW_SYSTEM_PROMPT,
    );

    // 7. Parse JSON response
    const result = parseReviewResponse(response.text);

    // 8. Record token usage (request already recorded by withRateLimit)
    const env = getServerEnv();
    const limiter = getRateLimiter(env.RATE_LIMIT_RPM, env.RATE_LIMIT_DAILY_TOKENS);
    const ip = getClientIP(request);
    limiter.recordTokens(ip, response.usage.totalTokens);

    // 9. Return typed response
    return successResponse(result);
  } catch (error) {
    // Log full error server-side; return generic message to client
    console.error("[review] AI call failed:", error instanceof Error ? error.message : "Unknown error");
    return errorResponse("AI request failed. Please try again.", 502);
  }
}

function parseReviewResponse(text: string): AIReviewResult {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  let raw: unknown;
  try {
    raw = JSON.parse(cleaned);
  } catch {
    console.error("[review] AI returned malformed JSON (length:", cleaned.length, ")");
    throw new Error("AI returned an unexpected response format");
  }

  const validated = aiReviewResponseSchema.safeParse(raw);
  if (!validated.success) {
    console.error("[review] AI response failed validation:", validated.error.message);
    return { issues: [], score: 50, suggestions: [], refactoredCode: "" };
  }

  return validated.data;
}
