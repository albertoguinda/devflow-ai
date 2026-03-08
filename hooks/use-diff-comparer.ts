"use client";

import { useState, useCallback, useMemo } from "react";
import type { DiffResult, DiffViewMode } from "@/types/diff-comparer";
import { processDiff, formatUnifiedDiff } from "@/lib/application/diff-comparer";
import { useToolHistory } from "@/hooks/use-tool-history";

interface DiffHistoryItem {
  id: string;
  originalPreview: string;
  modifiedPreview: string;
  stats: { added: number; removed: number; unchanged: number };
  timestamp: string;
}

export function useDiffComparer() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [result, setResult] = useState<DiffResult | null>(null);
  const [viewMode, setViewMode] = useState<DiffViewMode>("unified");
  const [isComparing, setIsComparing] = useState(false);

  const { history, addToHistory: addItemToHistory, clearHistory } =
    useToolHistory<DiffHistoryItem>("devflow-diff-comparer-history", 20);

  const canCompare = useMemo(
    () => original.trim().length > 0 || modified.trim().length > 0,
    [original, modified],
  );

  const formattedDiff = useMemo(() => {
    if (!result) return "";
    return formatUnifiedDiff(result.lines);
  }, [result]);

  const compare = useCallback(() => {
    if (!canCompare) return;
    setIsComparing(true);

    try {
      const diffResult = processDiff(original, modified);
      setResult(diffResult);

      const historyItem: DiffHistoryItem = {
        id: diffResult.id,
        originalPreview: original.slice(0, 80) + (original.length > 80 ? "..." : ""),
        modifiedPreview: modified.slice(0, 80) + (modified.length > 80 ? "..." : ""),
        stats: {
          added: diffResult.stats.added,
          removed: diffResult.stats.removed,
          unchanged: diffResult.stats.unchanged,
        },
        timestamp: diffResult.timestamp,
      };
      addItemToHistory(historyItem);
    } finally {
      setIsComparing(false);
    }
  }, [original, modified, canCompare, addItemToHistory]);

  const swap = useCallback(() => {
    setOriginal((prev) => {
      const currentModified = modified;
      setModified(prev);
      return currentModified;
    });
    setResult(null);
  }, [modified]);

  const reset = useCallback(() => {
    setOriginal("");
    setModified("");
    setResult(null);
  }, []);

  return {
    // State
    original,
    modified,
    result,
    viewMode,
    isComparing,
    canCompare,
    formattedDiff,
    history,

    // Setters
    setOriginal,
    setModified,
    setViewMode,

    // Actions
    compare,
    swap,
    reset,
    clearHistory,
  };
}
