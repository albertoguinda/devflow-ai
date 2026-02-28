"use client";

import { useMemo, useState, useEffect } from "react";
import {
  detectDataTypes,
  getRecommendations,
} from "@/lib/application/tool-recommendations";
import type { ToolRecommendation } from "@/types/tool-recommendations";

/**
 * Hook that provides context-aware tool recommendations
 * based on current tool input/output.
 * Debounces input by 300ms to avoid expensive recomputation on every keystroke.
 */
export function useToolRecommendations(
  toolId: string,
  input: string,
  output: string
): ToolRecommendation[] {
  const [debouncedInput, setDebouncedInput] = useState(input);
  const [debouncedOutput, setDebouncedOutput] = useState(output);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(input);
      setDebouncedOutput(output);
    }, 300);
    return () => clearTimeout(timer);
  }, [input, output]);

  return useMemo(() => {
    const detectedTypes = detectDataTypes(debouncedInput || debouncedOutput);
    return getRecommendations({
      toolId,
      input: debouncedInput,
      output: debouncedOutput,
      detectedTypes,
    });
  }, [toolId, debouncedInput, debouncedOutput]);
}
