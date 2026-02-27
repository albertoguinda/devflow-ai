"use client";

import { useState, useCallback } from "react";
import { processBase64, batchProcess } from "@/lib/application/base64";
import type { BatchItem } from "@/lib/application/base64";
import type { Base64Result, Base64Config, Base64Mode } from "@/types/base64";
import { DEFAULT_BASE64_CONFIG } from "@/types/base64";
import { useToolHistory } from "@/hooks/use-tool-history";

export function useBase64() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Base64Mode>("encode");
  const [config, setConfig] = useState<Base64Config>(DEFAULT_BASE64_CONFIG);
  const [result, setResult] = useState<Base64Result | null>(null);
  const [batchInput, setBatchInput] = useState("");
  const [batchResults, setBatchResults] = useState<BatchItem[]>([]);
  const { addToHistory } = useToolHistory<Base64Result>("devflow-base64-history", 20);

  const process = useCallback(() => {
    const res = processBase64(input, mode, config);
    setResult(res);
    if (res.isValid) {
      addToHistory(res);
    }
  }, [input, mode, config, addToHistory]);

  const updateConfig = useCallback(<K extends keyof Base64Config>(key: K, value: Base64Config[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const processBatch = useCallback(() => {
    const lines = batchInput.split("\n");
    const items = batchProcess(lines, mode, config);
    setBatchResults(items);
  }, [batchInput, mode, config]);

  const reset = useCallback(() => {
    setInput("");
    setResult(null);
    setBatchInput("");
    setBatchResults([]);
  }, []);

  const loadExample = (type: "text" | "json" | "encoded") => {
    const examples = {
      text: "Hello DevFlow!",
      json: '{"user": "alberto", "role": "developer"}',
      encoded: "SGVsbG8gRGV2RmxvdyE="
    };
    setInput(examples[type]);
  };

  return {
    input,
    mode,
    config,
    result,
    batchInput,
    batchResults,
    setInput,
    setMode,
    setBatchInput,
    updateConfig,
    process,
    processBatch,
    reset,
    loadExample,
  };
}
