"use client";

import { useState, useCallback } from "react";
import type {
  UuidConfig,
  UuidResult,
  UuidVersion,
  UuidFormat,
  UuidInfo,
} from "@/types/uuid-generator";
import { DEFAULT_UUID_CONFIG } from "@/types/uuid-generator";
import {
  processUuidGeneration,
  validateUuid,
  parseUuid,
  formatBulkExport,
  generateUuidV3,
  generateUuidV5,
  resolveNamespace,
  formatUuid,
} from "@/lib/application/uuid-generator";
import type { UuidNamespace } from "@/types/uuid-generator";
// Re-export for pages (dependency flow: Page → Hook → lib/application)
export { checkCollisions } from "@/lib/application/uuid-generator";
import { useToolHistory } from "@/hooks/use-tool-history";

interface HistoryItem {
  id: string;
  version: UuidVersion;
  format: UuidFormat;
  quantity: number;
  timestamp: string;
}

export function useUuidGenerator() {
  const [config, setConfig] = useState<UuidConfig>(DEFAULT_UUID_CONFIG);
  const [result, setResult] = useState<UuidResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<UuidInfo | null>(null);
  const [namespace, setNamespace] = useState<UuidNamespace>("dns");
  const [namespaceName, setNamespaceName] = useState("");
  const { history, addToHistory: addItemToHistory, clearHistory } =
    useToolHistory<HistoryItem>("devflow-uuid-generator-history", 50);

  const addToHistory = useCallback((cfg: UuidConfig) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      version: cfg.version,
      format: cfg.format,
      quantity: cfg.quantity,
      timestamp: new Date().toISOString(),
    };
    addItemToHistory(newItem);
  }, [addItemToHistory]);

  const generate = useCallback(async () => {
    setIsGenerating(true);
    try {
      if (config.version === "v3" || config.version === "v5") {
        const ns = resolveNamespace(namespace);
        const name = namespaceName || "devflow";
        const qty = Math.min(config.quantity, 1000);
        const uuids: string[] = [];
        for (let i = 0; i < qty; i++) {
          const n = qty > 1 ? `${name}-${i}` : name;
          const uuid =
            config.version === "v3"
              ? generateUuidV3(ns, n)
              : await generateUuidV5(ns, n);
          uuids.push(formatUuid(uuid, config.format));
        }
        setResult({
          id: crypto.randomUUID(),
          uuids,
          version: config.version,
          format: config.format,
          timestamp: new Date().toISOString(),
          collisionStats: { attempts: qty, collisions: 0, probability: "0% (deterministic)" },
        });
        addToHistory(config);
      } else {
        const genResult = processUuidGeneration(config);
        setResult(genResult);
        addToHistory(config);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [config, namespace, namespaceName, addToHistory]);

  const analyze = useCallback((input: string) => {
    if (!input.trim()) {
      setAnalysis(null);
      return;
    }
    const info = parseUuid(input);
    setAnalysis(info);
  }, []);

  const validate = useCallback((input: string) => {
    return validateUuid(input);
  }, []);

  const updateConfig = useCallback(
    <K extends keyof UuidConfig>(key: K, value: UuidConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const exportBulk = useCallback((uuids: string[], format: "text" | "json" | "csv" | "sql") => {
    return formatBulkExport(uuids, format);
  }, []);

  const reset = useCallback(() => {
    setConfig(DEFAULT_UUID_CONFIG);
    setResult(null);
    setAnalysis(null);
  }, []);

  return {
    config,
    result,
    analysis,
    history,
    namespace,
    namespaceName,
    isGenerating,
    setNamespace,
    setNamespaceName,
    updateConfig,
    generate,
    analyze,
    validate,
    reset,
    clearHistory,
    exportBulk,
  };
}
