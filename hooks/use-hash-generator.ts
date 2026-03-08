"use client";

import { useState, useCallback } from "react";
import {
  processHash,
  generateAllHashes,
  generateHmac,
  detectHashType,
  compareHashes,
} from "@/lib/application/hash-generator";
import type {
  HashAlgorithm,
  HashOutputFormat,
  HashConfig,
  HashResult,
  HashDetection,
} from "@/types/hash-generator";
import { DEFAULT_HASH_CONFIG } from "@/types/hash-generator";
import { useToolHistory } from "@/hooks/use-tool-history";

export function useHashGenerator() {
  const [input, setInput] = useState("");
  const [config, setConfig] = useState<HashConfig>(DEFAULT_HASH_CONFIG);
  const [result, setResult] = useState<HashResult | null>(null);
  const [allHashes, setAllHashes] = useState<Record<HashAlgorithm, string> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // HMAC state
  const [hmacKey, setHmacKey] = useState("");
  const [hmacResult, setHmacResult] = useState("");

  // Compare state
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const [compareResult, setCompareResult] = useState<boolean | null>(null);

  // Detection state
  const [detectInput, setDetectInput] = useState("");
  const [detection, setDetection] = useState<HashDetection | null>(null);

  const { addToHistory } = useToolHistory<HashResult>("devflow-hash-history", 20);

  const generate = useCallback(async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    try {
      const res = await processHash(input, config);
      setResult(res);
      addToHistory(res);

      // Also generate all hashes
      const all = await generateAllHashes(input, config.outputFormat);
      setAllHashes(all);
    } finally {
      setIsGenerating(false);
    }
  }, [input, config, addToHistory]);

  const generateHmacHash = useCallback(async () => {
    if (!input.trim() || !hmacKey.trim()) return;
    setIsGenerating(true);
    try {
      const hash = await generateHmac(input, {
        algorithm: config.algorithm,
        key: hmacKey,
        outputFormat: config.outputFormat,
      });
      setHmacResult(hash);
    } finally {
      setIsGenerating(false);
    }
  }, [input, hmacKey, config]);

  const compare = useCallback(() => {
    setCompareResult(compareHashes(compareA, compareB));
  }, [compareA, compareB]);

  const detect = useCallback(() => {
    setDetection(detectHashType(detectInput));
  }, [detectInput]);

  const updateAlgorithm = useCallback((algorithm: HashAlgorithm) => {
    setConfig((prev) => ({ ...prev, algorithm }));
  }, []);

  const updateOutputFormat = useCallback((outputFormat: HashOutputFormat) => {
    setConfig((prev) => ({ ...prev, outputFormat }));
  }, []);

  const reset = useCallback(() => {
    setInput("");
    setResult(null);
    setAllHashes(null);
    setHmacKey("");
    setHmacResult("");
    setCompareA("");
    setCompareB("");
    setCompareResult(null);
    setDetectInput("");
    setDetection(null);
  }, []);

  return {
    input,
    config,
    result,
    allHashes,
    isGenerating,
    hmacKey,
    hmacResult,
    compareA,
    compareB,
    compareResult,
    detectInput,
    detection,
    setInput,
    setHmacKey,
    setCompareA,
    setCompareB,
    setDetectInput,
    generate,
    generateHmacHash,
    compare,
    detect,
    updateAlgorithm,
    updateOutputFormat,
    reset,
  };
}
