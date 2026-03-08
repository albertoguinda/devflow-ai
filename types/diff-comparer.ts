// Diff / Text Comparer Types

export type DiffLineType = "added" | "removed" | "unchanged";

export interface DiffLine {
  type: DiffLineType;
  content: string;
  lineNumber: {
    old: number | null;
    new: number | null;
  };
}

export interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
  total: number;
}

export interface DiffResult {
  id: string;
  original: string;
  modified: string;
  lines: DiffLine[];
  stats: DiffStats;
  timestamp: string;
}

export type DiffViewMode = "unified" | "side-by-side";
