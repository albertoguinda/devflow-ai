"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  PasswordConfig,
  PasswordResult,
  PasswordStrength,
} from "@/types/password-generator";
import { DEFAULT_PASSWORD_CONFIG } from "@/types/password-generator";
import {
  processPassword,
  evaluateStrength,
  generateBatch,
} from "@/lib/application/password-generator";
import { useToolHistory } from "@/hooks/use-tool-history";

interface HistoryItem {
  id: string;
  password: string;
  length: number;
  entropy: number;
  level: string;
  timestamp: string;
}

export function usePasswordGenerator() {
  const [config, setConfig] = useState<PasswordConfig>(DEFAULT_PASSWORD_CONFIG);
  const [result, setResult] = useState<PasswordResult | null>(null);
  const [batchResults, setBatchResults] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { history, addToHistory: addItemToHistory, clearHistory } =
    useToolHistory<HistoryItem>("devflow-password-generator-history", 20);

  const strength: PasswordStrength | null = useMemo(() => {
    if (!result) return null;
    return result.strength;
  }, [result]);

  const addToHistory = useCallback(
    (res: PasswordResult) => {
      const newItem: HistoryItem = {
        id: res.id,
        password: res.password,
        length: res.config.length,
        entropy: res.strength.entropy,
        level: res.strength.level,
        timestamp: res.timestamp,
      };
      addItemToHistory(newItem);
    },
    [addItemToHistory],
  );

  const generate = useCallback(() => {
    setIsGenerating(true);
    try {
      const res = processPassword(config);
      setResult(res);
      setBatchResults([]);
      addToHistory(res);
    } finally {
      setIsGenerating(false);
    }
  }, [config, addToHistory]);

  const generateBatchPasswords = useCallback(
    (count: number = 5) => {
      setIsGenerating(true);
      try {
        const passwords = generateBatch(config, count);
        setBatchResults(passwords);
      } finally {
        setIsGenerating(false);
      }
    },
    [config],
  );

  const updateConfig = useCallback(
    <K extends keyof PasswordConfig>(key: K, value: PasswordConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const evaluateCustomPassword = useCallback((password: string) => {
    return evaluateStrength(password);
  }, []);

  const reset = useCallback(() => {
    setConfig(DEFAULT_PASSWORD_CONFIG);
    setResult(null);
    setBatchResults([]);
  }, []);

  return {
    // State
    config,
    result,
    strength,
    batchResults,
    isGenerating,
    history,

    // Actions
    generate,
    generateBatchPasswords,
    updateConfig,
    evaluateCustomPassword,
    reset,
    clearHistory,
  };
}
