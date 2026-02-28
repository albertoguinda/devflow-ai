"use client";

import { useState, useCallback } from "react";
import {
  exportAllSettings,
  validateImport,
  importSettings,
  getExportFilename,
} from "@/lib/application/settings-export";
import { useTranslation } from "@/hooks/use-translation";
import { downloadBlob } from "@/lib/utils/download";

interface UseSettingsExportReturn {
  isExporting: boolean;
  isImporting: boolean;
  lastResult: { type: "success" | "error"; message: string } | null;
  handleExport: () => void;
  handleImport: (file: File) => Promise<void>;
  clearResult: () => void;
}

export function useSettingsExport(): UseSettingsExportReturn {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastResult, setLastResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleExport = useCallback(() => {
    setIsExporting(true);
    try {
      const data = exportAllSettings();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      downloadBlob(blob, getExportFilename());
      setLastResult({ type: "success", message: t("settings.exportSuccess", { count: String(Object.keys(data.settings).length) }) });
    } catch (e) {
      setLastResult({ type: "error", message: e instanceof Error ? e.message : t("settings.exportFailed") });
    } finally {
      setIsExporting(false);
    }
  }, [t]);

  const handleImport = useCallback(async (file: File) => {
    setIsImporting(true);
    setLastResult(null);
    try {
      const MAX_IMPORT_SIZE = 1024 * 1024; // 1 MB
      if (file.size > MAX_IMPORT_SIZE) {
        setLastResult({ type: "error", message: t("settings.importFileTooLarge") });
        return;
      }
      const text = await file.text();
      const parsed = JSON.parse(text);
      const validation = validateImport(parsed);

      if (!validation.valid || !validation.data) {
        setLastResult({ type: "error", message: validation.error ?? t("settings.importFailed") });
        return;
      }

      const result = importSettings(validation.data);
      setLastResult({ type: "success", message: t("settings.importSuccess", { count: String(result.imported) }) });
    } catch (e) {
      setLastResult({ type: "error", message: e instanceof Error ? e.message : t("settings.importFailed") });
    } finally {
      setIsImporting(false);
    }
  }, [t]);

  const clearResult = useCallback(() => setLastResult(null), []);

  return { isExporting, isImporting, lastResult, handleExport, handleImport, clearResult };
}
