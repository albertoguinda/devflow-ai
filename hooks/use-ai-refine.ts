"use client";

import useSWRMutation from "swr/mutation";
import type { AIRefineResult } from "@/types/ai";
import { aiFetcher } from "@/lib/api/fetcher";

interface RefineArgs {
  prompt: string;
  goal: "clarity" | "specificity" | "conciseness";
  locale?: "en" | "es" | undefined;
}

async function refineFetcher(
  _key: string,
  { arg }: { arg: RefineArgs },
): Promise<AIRefineResult> {
  return aiFetcher<AIRefineResult>("/api/ai/refine", arg);
}

export function useAIRefine() {
  const { trigger, data, error, isMutating } = useSWRMutation(
    "/api/ai/refine",
    refineFetcher,
  );

  return {
    refineWithAI: (prompt: string, goal: RefineArgs["goal"], locale?: "en" | "es") =>
      trigger({ prompt, goal, locale }),
    aiResult: data ?? null,
    aiError: error as Error | null,
    isAILoading: isMutating,
  };
}
