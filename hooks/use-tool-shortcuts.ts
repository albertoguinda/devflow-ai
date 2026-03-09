"use client";

import { useEffect, useCallback } from "react";

export interface UseToolShortcutsOptions {
  /** Ctrl+Enter / Cmd+Enter — execute primary action */
  onExecute?: () => void;
  /** Ctrl+Shift+C / Cmd+Shift+C — copy output */
  onCopyOutput?: () => void;
  /** Ctrl+Shift+S / Cmd+Shift+S — share state */
  onShare?: () => void;
  /** Escape — clear/reset input (only when no modal/dialog is open) */
  onClear?: () => void;
}

/**
 * Registers tool-specific keyboard shortcuts on a tool page.
 *
 * Shortcuts:
 * - Ctrl/Cmd + Enter → onExecute
 * - Ctrl/Cmd + Shift + C → onCopyOutput
 * - Ctrl/Cmd + Shift + S → onShare
 * - Escape → onClear (only when no dialog is open)
 *
 * Each shortcut only fires when the corresponding callback is provided.
 * Cleans up listeners on unmount.
 */
export function useToolShortcuts({
  onExecute,
  onCopyOutput,
  onShare,
  onClear,
}: UseToolShortcutsOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd + Enter → execute primary action
      if (mod && e.key === "Enter" && onExecute) {
        e.preventDefault();
        onExecute();
        return;
      }

      // Ctrl/Cmd + Shift + C → copy output
      if (mod && e.shiftKey && (e.key === "C" || e.key === "c") && onCopyOutput) {
        e.preventDefault();
        onCopyOutput();
        return;
      }

      // Ctrl/Cmd + Shift + S → share state
      if (mod && e.shiftKey && (e.key === "S" || e.key === "s") && onShare) {
        e.preventDefault();
        onShare();
        return;
      }

      // Escape → clear/reset (only when no modal/dialog is open)
      if (e.key === "Escape" && onClear) {
        const dialog = document.querySelector('[role="dialog"]');
        if (dialog) return; // let the dialog handle Escape
        e.preventDefault();
        onClear();
        return;
      }
    },
    [onExecute, onCopyOutput, onShare, onClear],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
