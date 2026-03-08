"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  ConversionResult,
  GenerationResult,
  WizardConfig,
} from "@/types/variable-name-wizard";
import { DEFAULT_WIZARD_CONFIG } from "@/types/variable-name-wizard";
import { convertToAll, generateSuggestions } from "@/lib/application/variable-name-wizard";
// Re-export for pages (dependency flow: Page → Hook → lib/application)
export { convertToAll, expandAbbreviations, abbreviateName } from "@/lib/application/variable-name-wizard";
import { useLocaleStore } from "@/lib/stores/locale-store";
import { useTranslation } from "@/hooks/use-translation";

interface UseVariableNameWizardReturn {
  input: string;
  mode: "convert" | "generate";
  config: WizardConfig;
  conversionResult: ConversionResult | null;
  generationResult: GenerationResult | null;
  isProcessing: boolean;
  error: string | null;
  setInput: (input: string) => void;
  setMode: (mode: "convert" | "generate") => void;
  updateConfig: <K extends keyof WizardConfig>(key: K, value: WizardConfig[K]) => void;
  convert: () => Promise<void>;
  generate: () => Promise<void>;
  reset: () => void;
  loadExample: () => void;
}

const STORAGE_KEY = "devflow-variable-name-wizard-config";

function loadConfig(): WizardConfig {
  if (typeof window === "undefined") return DEFAULT_WIZARD_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WIZARD_CONFIG;
    return { ...DEFAULT_WIZARD_CONFIG, ...JSON.parse(raw) } as WizardConfig;
  } catch {
    return DEFAULT_WIZARD_CONFIG;
  }
}

export function useVariableNameWizard(): UseVariableNameWizardReturn {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"convert" | "generate">("generate");
  const [config, setConfig] = useState<WizardConfig>(loadConfig);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch { /* quota exceeded — ignore */ }
    }, 300);
    return () => {
      if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current);
    };
  }, [config]);

  const convert = useCallback(async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = convertToAll(input);
      setConversionResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("varName.conversionFailed"));
    } finally {
      setIsProcessing(false);
    }
  }, [input, t]);

  const generate = useCallback(async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = generateSuggestions(input, config.type, config, locale);
      setGenerationResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("varName.generationFailed"));
    } finally {
      setIsProcessing(false);
    }
  }, [input, config, locale, t]);

  const updateConfig = useCallback(<K extends keyof WizardConfig>(key: K, value: WizardConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setInput("");
    setConversionResult(null);
    setGenerationResult(null);
    setError(null);
  }, []);

  const loadExample = useCallback(() => {
    setInput(t("varName.exampleInput"));
  }, [t]);

  return {
    input,
    mode,
    config,
    conversionResult,
    generationResult,
    isProcessing,
    error,
    setInput,
    setMode,
    updateConfig,
    convert,
    generate,
    reset,
    loadExample,
  };
}
