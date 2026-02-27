"use client";

import { useState, useCallback } from "react";
import type { RegexAnalysis, TestResult, RegexFlavor } from "@/types/regex-humanizer";
import { explainRegex, generateRegex, testRegex } from "@/lib/application/regex-humanizer";
// Re-export for pages (dependency flow: Page → Hook → lib/application)
export { getCommonPatterns } from "@/lib/application/regex-humanizer";
import { useLocaleStore } from "@/lib/stores/locale-store";
import { useToolHistory } from "@/hooks/use-tool-history";
import { useTranslation } from "@/hooks/use-translation";

interface HistoryItem {
  id: string;
  input: string;
  output: string;
  timestamp: string;
}

interface UseRegexHumanizerReturn {
  pattern: string;
  flavor: RegexFlavor;
  explanation: RegexAnalysis | null;
  testResult: TestResult | null;
  isExplaining: boolean;
  isGenerating: boolean;
  error: string | null;
  history: HistoryItem[];
  setPattern: (pattern: string) => void;
  setFlavor: (flavor: RegexFlavor) => void;
  explain: (pattern: string) => Promise<void>;
  generate: (description: string) => Promise<void>;
  test: (pattern: string, text: string) => Promise<void>;
  reset: () => void;
  clearHistory: () => void;
}

export function useRegexHumanizer(): UseRegexHumanizerReturn {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [pattern, setPattern] = useState("");
  const [flavor, setFlavor] = useState<RegexFlavor>("javascript");
  const [explanation, setExplanation] = useState<RegexAnalysis | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { history, addToHistory: addItemToHistory, clearHistory } =
    useToolHistory<HistoryItem>("devflow-regex-humanizer-history", 15);

  const explain = useCallback(async (patternInput: string) => {
    if (!patternInput.trim()) return;
    setIsExplaining(true);
    setError(null);
    try {
      const result = explainRegex(patternInput, flavor, locale);
      setExplanation(result);
      addItemToHistory({
        id: crypto.randomUUID(),
        input: patternInput.slice(0, 80) + (patternInput.length > 80 ? "..." : ""),
        output: result.explanation.slice(0, 80) + (result.explanation.length > 80 ? "..." : ""),
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("regex.explanationFailed"));
    } finally {
      setIsExplaining(false);
    }
  }, [locale, flavor, addItemToHistory, t]);

  const generate = useCallback(async (description: string) => {
    if (!description.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const regex = generateRegex(description, locale);
      setPattern(regex);
      // Auto-explain generated regex
      const explanationResult = explainRegex(regex, flavor, locale);
      setExplanation(explanationResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("regex.generationFailed"));
    } finally {
      setIsGenerating(false);
    }
  }, [locale, flavor, t]);

  const test = useCallback(async (regexPattern: string, text: string) => {
    setError(null);
    try {
      const result = testRegex(regexPattern, text, locale);
      setTestResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("regex.testFailed"));
    }
  }, [locale, t]);

  const reset = useCallback(() => {
    setPattern("");
    setExplanation(null);
    setTestResult(null);
    setError(null);
  }, []);

  return {
    pattern,
    flavor,
    explanation,
    testResult,
    isExplaining,
    isGenerating,
    error,
    history,
    setPattern,
    setFlavor,
    explain,
    generate,
    test,
    reset,
    clearHistory,
  };
}
