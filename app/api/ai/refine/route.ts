import { NextRequest } from "next/server";
import type { AIRefineResult } from "@/types/ai";
import { aiRefineSchema, aiRefineResponseSchema } from "@/lib/api/schemas";
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
import { REFINE_SYSTEM_PROMPT } from "@/lib/api/prompts";

export async function POST(request: NextRequest) {
  const byok = extractBYOK(request);
  const isByok = Boolean(byok);

  const rateLimited = withRateLimit(request, isByok);
  if (rateLimited) return rateLimited;

  const parsed = await validateBody(request, aiRefineSchema);
  if ("error" in parsed) return parsed.error;
  const { prompt, goal } = parsed.data;

  const provider = createAIProvider(byok);
  if (!provider) {
    return errorResponse("AI is not configured on this server", 503);
  }

  const userPrompt = `Goal: ${goal}\n\nPrompt to refine:\n${prompt}`;

  try {
    const response = await provider.generateText(
      userPrompt,
      REFINE_SYSTEM_PROMPT,
    );

    const result = parseRefineResponse(response.text);

    // Record token usage (request already recorded by withRateLimit)
    const env = getServerEnv();
    const limiter = getRateLimiter(env.RATE_LIMIT_RPM, env.RATE_LIMIT_DAILY_TOKENS);
    const ip = getClientIP(request);
    limiter.recordTokens(ip, response.usage.totalTokens);

    return successResponse(result);
  } catch (error) {
    console.error("[refine] AI call failed:", error);
    return errorResponse("AI request failed. Please try again.", 502);
  }
}

function parseRefineResponse(text: string): AIRefineResult {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  let raw: unknown;
  try {
    raw = JSON.parse(cleaned);
  } catch {
    console.error("[refine] AI returned malformed JSON:", cleaned.slice(0, 200));
    throw new Error("AI returned an unexpected response format");
  }

  const validated = aiRefineResponseSchema.safeParse(raw);
  if (!validated.success) {
    console.error("[refine] AI response failed validation:", validated.error.message);
    return { refinedPrompt: "", changelog: [], score: 50 };
  }

  return validated.data;
}
