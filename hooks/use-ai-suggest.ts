"use client";

import useSWRMutation from "swr/mutation";
import type { AISuggestResult } from "@/types/ai";
import { aiFetcher } from "@/lib/api/fetcher";

interface SuggestArgs {
  context: string;
  type?: string | undefined;
  language?: string | undefined;
  mode: "variable-name" | "regex-generate" | "commit-message" | "cron-generate" | "json-explain" | "base64-explain" | "dto-optimize" | "http-explain" | "tailwind-optimize" | "cost-advise" | "context-optimize";
  locale?: string | undefined;
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
    suggestWithAI: (context: string, type?: string, language?: string, locale?: string) =>
      trigger({ context, type, language, mode: "variable-name", locale }),
    generateRegexWithAI: (description: string, locale?: string) =>
      trigger({ context: description, mode: "regex-generate", locale }),
    generateCommitWithAI: (description: string, locale?: string) =>
      trigger({ context: description, mode: "commit-message", locale }),
    generateCronWithAI: (description: string, locale?: string) =>
      trigger({ context: description, mode: "cron-generate", locale }),
    explainJsonWithAI: (json: string, locale?: string) =>
      trigger({ context: json, mode: "json-explain", locale }),
    explainBase64WithAI: (content: string, locale?: string) =>
      trigger({ context: content, mode: "base64-explain", locale }),
    optimizeDtoWithAI: (code: string, locale?: string) =>
      trigger({ context: code, mode: "dto-optimize", locale }),
    explainHttpStatusWithAI: (description: string, locale?: string) =>
      trigger({ context: description, mode: "http-explain", locale }),
    optimizeTailwindWithAI: (classes: string, locale?: string) =>
      trigger({ context: classes, mode: "tailwind-optimize", locale }),
    adviseCostWithAI: (scenario: string, locale?: string) =>
      trigger({ context: scenario, mode: "cost-advise", locale }),
    optimizeContextWithAI: (contextSummary: string, locale?: string) =>
      trigger({ context: contextSummary, mode: "context-optimize", locale }),
    aiResult: data ?? null,
    aiError: error as Error | null,
    isAILoading: isMutating,
  };
}
