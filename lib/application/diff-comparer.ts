// Diff / Text Comparer Application Logic
// Uses LCS (Longest Common Subsequence) for optimal diff computation

import type { DiffLine, DiffStats, DiffResult } from "@/types/diff-comparer";

/**
 * Computes the LCS table for two arrays of strings.
 * Returns a 2D array where lcs[i][j] = length of LCS of a[0..i-1] and b[0..j-1].
 */
function buildLCSTable(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const table: number[][] = [];

  for (let i = 0; i <= m; i++) {
    table[i] = [];
    for (let j = 0; j <= n; j++) {
      table[i]![j] = 0;
    }
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        table[i]![j] = (table[i - 1]?.[j - 1] ?? 0) + 1;
      } else {
        table[i]![j] = Math.max(table[i - 1]?.[j] ?? 0, table[i]?.[j - 1] ?? 0);
      }
    }
  }

  return table;
}

/**
 * Backtracks through the LCS table to produce a list of DiffLines.
 */
function backtrackLCS(
  table: number[][],
  a: string[],
  b: string[],
  i: number,
  j: number,
): DiffLine[] {
  const result: DiffLine[] = [];

  let ci = i;
  let cj = j;

  // Collect in reverse, then reverse at the end
  const stack: DiffLine[] = [];

  while (ci > 0 || cj > 0) {
    if (ci > 0 && cj > 0 && a[ci - 1] === b[cj - 1]) {
      stack.push({
        type: "unchanged",
        content: a[ci - 1]!,
        lineNumber: { old: ci, new: cj },
      });
      ci--;
      cj--;
    } else if (cj > 0 && (ci === 0 || (table[ci]?.[cj - 1] ?? 0) >= (table[ci - 1]?.[cj] ?? 0))) {
      stack.push({
        type: "added",
        content: b[cj - 1]!,
        lineNumber: { old: null, new: cj },
      });
      cj--;
    } else {
      stack.push({
        type: "removed",
        content: a[ci - 1]!,
        lineNumber: { old: ci, new: null },
      });
      ci--;
    }
  }

  // Reverse to get correct order
  for (let k = stack.length - 1; k >= 0; k--) {
    result.push(stack[k]!);
  }

  return result;
}

/**
 * Computes a diff between original and modified text using LCS.
 * Splits input by lines and produces an array of DiffLine entries.
 */
export function computeDiff(original: string, modified: string): DiffLine[] {
  // Handle both empty case
  if (original === "" && modified === "") {
    return [];
  }

  const originalLines = original.split("\n");
  const modifiedLines = modified.split("\n");

  // Handle one-side empty
  if (original === "") {
    return modifiedLines.map((line, idx) => ({
      type: "added" as const,
      content: line,
      lineNumber: { old: null, new: idx + 1 },
    }));
  }

  if (modified === "") {
    return originalLines.map((line, idx) => ({
      type: "removed" as const,
      content: line,
      lineNumber: { old: idx + 1, new: null },
    }));
  }

  const table = buildLCSTable(originalLines, modifiedLines);
  return backtrackLCS(table, originalLines, modifiedLines, originalLines.length, modifiedLines.length);
}

/**
 * Computes statistics from a diff result.
 */
export function getDiffStats(lines: DiffLine[]): DiffStats {
  let added = 0;
  let removed = 0;
  let unchanged = 0;

  for (const line of lines) {
    switch (line.type) {
      case "added":
        added++;
        break;
      case "removed":
        removed++;
        break;
      case "unchanged":
        unchanged++;
        break;
    }
  }

  return {
    added,
    removed,
    unchanged,
    total: added + removed + unchanged,
  };
}

/**
 * Processes a full diff: computes lines, stats, and wraps in a DiffResult.
 */
export function processDiff(original: string, modified: string): DiffResult {
  const lines = computeDiff(original, modified);
  const stats = getDiffStats(lines);

  return {
    id: crypto.randomUUID(),
    original,
    modified,
    lines,
    stats,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Formats diff lines as unified diff text (similar to `diff -u` output).
 */
export function formatUnifiedDiff(lines: DiffLine[]): string {
  const parts: string[] = [];

  for (const line of lines) {
    switch (line.type) {
      case "added":
        parts.push(`+ ${line.content}`);
        break;
      case "removed":
        parts.push(`- ${line.content}`);
        break;
      case "unchanged":
        parts.push(`  ${line.content}`);
        break;
    }
  }

  return parts.join("\n");
}
