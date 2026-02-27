import { NextRequest } from "next/server";
import { encodingForModel, getEncoding } from "js-tiktoken";
import type { AITokenizeResult, AITokenSegment } from "@/types/ai";
import { aiTokenizeSchema } from "@/lib/api/schemas";
import {
  extractBYOK,
  withRateLimit,
  validateBody,
  successResponse,
  errorResponse,
} from "@/lib/api/middleware";

/**
 * Tokenize endpoint — uses real BPE tokenization via js-tiktoken.
 * No AI call needed, but still rate-limited to prevent abuse.
 */
export async function POST(request: NextRequest) {
  const byok = extractBYOK(request);
  const isByok = Boolean(byok);

  const rateLimited = withRateLimit(request, isByok);
  if (rateLimited) return rateLimited;

  const parsed = await validateBody(request, aiTokenizeSchema);
  if ("error" in parsed) return parsed.error;
  const { text, model } = parsed.data;

  try {
    const encoding = getEncodingForModel(model);
    const tokens = encoding.encode(text);

    // Guard against oversized responses (CPU + memory protection)
    const MAX_SEGMENTS = 10_000;
    if (tokens.length > MAX_SEGMENTS) {
      return errorResponse(
        `Input produces ${tokens.length} tokens; maximum for visualization is ${MAX_SEGMENTS}.`,
        400,
      );
    }

    const segments: AITokenSegment[] = [];
    const decoder = new TextDecoder("utf-8", { fatal: false });

    for (const tokenId of tokens) {
      const tokenBytes = encoding.decode([tokenId]);
      const tokenText =
        typeof tokenBytes === "string"
          ? tokenBytes
          : decoder.decode(tokenBytes as Uint8Array);
      segments.push({ text: tokenText, tokenId });
    }

    const result: AITokenizeResult = {
      segments,
      totalTokens: tokens.length,
      model,
    };

    // Request already recorded by withRateLimit (no token recording for tokenize)

    return successResponse(result);
  } catch (error) {
    console.error("[tokenize] Tokenization failed:", error);
    return errorResponse("Tokenization failed. Please try again.", 500);
  }
}

function getEncodingForModel(model: string) {
  switch (model) {
    case "gpt-4o":
    case "o200k_base":
      return getEncoding("o200k_base");
    case "gpt-4":
    case "gpt-3.5-turbo":
    case "cl100k_base":
      return getEncoding("cl100k_base");
    default:
      return encodingForModel("gpt-4o");
  }
}
