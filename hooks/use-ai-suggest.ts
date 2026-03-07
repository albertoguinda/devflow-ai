"use client";

import useSWRMutation from "swr/mutation";
import type { AISuggestResult } from "@/types/ai";
import { aiFetcher } from "@/lib/api/fetcher";

interface SuggestArgs {
  context: string;
  type?: string | undefined;
  language?: string | undefined;
  mode: "variable-name" | "regex-generate" | "commit-message" | "cron-generate" | "json-explain" | "base64-explain" | "dto-optimize" | "http-explain" | "tailwind-optimize" | "cost-advise" | "context-optimize";
  locale?: "en" | "es" | undefined;
}

async function suggestFetcher(
  _key: string,
  { arg }: { arg: SuggestArgs },
): Promise<AISuggestResult> {
  return aiFetcher<AISuggestResult>("/api/ai/suggest", arg);
}

export function useAISuggest() {
  const { trigger, data, error, isMutating } = useSWRMutation(
    "/api/ai/suggest",
    suggestFetcher,
  );

  return {
    suggestWithAI: (context: string, type?: string, language?: string, locale?: "en" | "es") =>
      trigger({ context, type, language, mode: "variable-name", locale }),
    generateRegexWithAI: (description: string, locale?: "en" | "es") =>
      trigger({ context: description, mode: "regex-generate", locale }),
    generateCommitWithAI: (description: string, locale?: "en" | "es") =>
      trigger({ context: description, mode: "commit-message", locale }),
    generateCronWithAI: (description: string, locale?: "en" | "es") =>
      trigger({ context: description, mode: "cron-generate", locale }),
    explainJsonWithAI: (json: string, locale?: "en" | "es") =>
      trigger({ context: json, mode: "json-explain", locale }),
    explainBase64WithAI: (content: string, locale?: "en" | "es") =>
      trigger({ context: content, mode: "base64-explain", locale }),
    optimizeDtoWithAI: (code: string, locale?: "en" | "es") =>
      trigger({ context: code, mode: "dto-optimize", locale }),
    explainHttpStatusWithAI: (description: string, locale?: "en" | "es") =>
      trigger({ context: description, mode: "http-explain", locale }),
    optimizeTailwindWithAI: (classes: string, locale?: "en" | "es") =>
      trigger({ context: classes, mode: "tailwind-optimize", locale }),
    adviseCostWithAI: (scenario: string, locale?: "en" | "es") =>
      trigger({ context: scenario, mode: "cost-advise", locale }),
    optimizeContextWithAI: (contextSummary: string, locale?: "en" | "es") =>
      trigger({ context: contextSummary, mode: "context-optimize", locale }),
    aiResult: data ?? null,
    aiError: error as Error | null,
    isAILoading: isMutating,
  };
}
