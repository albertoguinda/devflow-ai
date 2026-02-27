import type { AIStatusResult } from "@/types/ai";
import { successResponse } from "@/lib/api/middleware";

/**
 * AI status endpoint — reports availability without leaking internal config.
 * No rate limiting on this endpoint.
 */
export async function GET() {
  // Always configured — Pollinations fallback requires no API key
  const result: AIStatusResult = {
    configured: true,
    provider: "pollinations",
    premiumConfigured: false,
    limits: {
      rpm: 0,
      dailyTokens: 0,
    },
  };

  return successResponse(result);
}
