import type { SettingsExport } from "@/types/settings-export";

const APP_PREFIX = "devflow-";
const CURRENT_VERSION = "1.0";

/** Keys containing user-generated content that should not be exported */
const EXPORT_DENYLIST = new Set([
  "devflow-code-review-history",
  "devflow-dto-matic-history",
  "devflow-git-commit-history",
  "devflow-prompt-analyzer-history",
  "devflow-shared-data",
]);

/**
 * Export all DevFlow settings from localStorage
 */
export function exportAllSettings(): SettingsExport {
  const settings: Record<string, string> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(APP_PREFIX) && !EXPORT_DENYLIST.has(key)) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        settings[key] = value;
      }
    }
  }

  return {
    version: CURRENT_VERSION,
    exportedAt: new Date().toISOString(),
    appName: "devflow-ai",
    settings,
  };
}

/**
 * Validate an import payload
 */
export function validateImport(data: unknown): { valid: boolean; error?: string; data?: SettingsExport } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid format: expected JSON object" };
  }

  const obj = data as Record<string, unknown>;

  if (obj["appName"] !== "devflow-ai") {
    return { valid: false, error: "Invalid file: not a DevFlow AI export" };
  }

  if (typeof obj["version"] !== "string") {
    return { valid: false, error: "Missing version field" };
  }

  if (typeof obj["settings"] !== "object" || obj["settings"] === null) {
    return { valid: false, error: "Missing or invalid settings field" };
  }

  const settings = obj["settings"] as Record<string, unknown>;
  const cleanSettings: Record<string, string> = {};

  for (const [key, value] of Object.entries(settings)) {
    if (!key.startsWith(APP_PREFIX)) continue; // Skip non-devflow keys
    if (typeof value === "string") {
      cleanSettings[key] = value;
    }
  }

  return {
    valid: true,
    data: {
      version: obj["version"] as string,
      exportedAt: typeof obj["exportedAt"] === "string" ? obj["exportedAt"] : new Date().toISOString(),
      appName: "devflow-ai",
      settings: cleanSettings,
    },
  };
}

/**
 * Import settings into localStorage
 */
const MAX_VALUE_LENGTH = 1_000_000; // 1MB per key

export function importSettings(exportData: SettingsExport): { imported: number; errors: string[] } {
  let imported = 0;
  const errors: string[] = [];

  for (const [key, value] of Object.entries(exportData.settings)) {
    if (key.startsWith(APP_PREFIX) && value.length <= MAX_VALUE_LENGTH) {
      try {
        localStorage.setItem(key, value);
        imported++;
      } catch {
        errors.push(key);
      }
    }
  }

  return { imported, errors };
}

/**
 * Generate a download filename
 */
export function getExportFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `devflow-settings-${date}.json`;
}
