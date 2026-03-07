"use client";

import useSWRMutation from "swr/mutation";
import type { AIReviewResult } from "@/types/ai";
import type { SupportedLanguage } from "@/types/code-review";
import { aiFetcher } from "@/lib/api/fetcher";

interface ReviewArgs {
  code: string;
  language: SupportedLanguage;
  locale?: "en" | "es" | undefined;
}

async function reviewFetcher(
  _key: string,
  { arg }: { arg: ReviewArgs },
): Promise<AIReviewResult> {
  return aiFetcher<AIReviewResult>("/api/ai/review", arg);
}

export function useAICodeReview() {
  const { trigger, data, error, isMutating } = useSWRMutation(
    "/api/ai/review",
    reviewFetcher,
  );

  return {
    reviewWithAI: (code: string, language: SupportedLanguage, locale?: "en" | "es") =>
      trigger({ code, language, locale }),
    aiResult: data ?? null,
    aiError: error as Error | null,
    isAILoading: isMutating,
  };
}
