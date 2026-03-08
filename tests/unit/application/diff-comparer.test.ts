import { describe, it, expect, vi } from "vitest";
import {
  computeDiff,
  getDiffStats,
  processDiff,
  formatUnifiedDiff,
} from "@/lib/application/diff-comparer";

describe("diff-comparer", () => {
  // ─── computeDiff ───

  describe("computeDiff", () => {
    it("should return empty array for two empty strings", () => {
      const result = computeDiff("", "");
      expect(result).toEqual([]);
    });

    it("should mark all lines as added when original is empty", () => {
      const result = computeDiff("", "line1\nline2");
      expect(result).toHaveLength(2);
      expect(result[0]?.type).toBe("added");
      expect(result[0]?.content).toBe("line1");
      expect(result[1]?.type).toBe("added");
      expect(result[1]?.content).toBe("line2");
    });

    it("should mark all lines as removed when modified is empty", () => {
      const result = computeDiff("line1\nline2", "");
      expect(result).toHaveLength(2);
      expect(result[0]?.type).toBe("removed");
      expect(result[0]?.content).toBe("line1");
      expect(result[1]?.type).toBe("removed");
      expect(result[1]?.content).toBe("line2");
    });

    it("should return all unchanged for identical texts", () => {
      const text = "hello\nworld\nfoo";
      const result = computeDiff(text, text);
      expect(result).toHaveLength(3);
      for (const line of result) {
        expect(line.type).toBe("unchanged");
      }
    });

    it("should detect added lines", () => {
      const result = computeDiff("line1\nline3", "line1\nline2\nline3");
      expect(result).toHaveLength(3);
      expect(result[0]?.type).toBe("unchanged");
      expect(result[0]?.content).toBe("line1");
      expect(result[1]?.type).toBe("added");
      expect(result[1]?.content).toBe("line2");
      expect(result[2]?.type).toBe("unchanged");
      expect(result[2]?.content).toBe("line3");
    });

    it("should detect removed lines", () => {
      const result = computeDiff("line1\nline2\nline3", "line1\nline3");
      expect(result).toHaveLength(3);
      expect(result[0]?.type).toBe("unchanged");
      expect(result[0]?.content).toBe("line1");
      expect(result[1]?.type).toBe("removed");
      expect(result[1]?.content).toBe("line2");
      expect(result[2]?.type).toBe("unchanged");
      expect(result[2]?.content).toBe("line3");
    });

    it("should detect mixed changes (add + remove)", () => {
      const result = computeDiff("alpha\nbeta\ngamma", "alpha\nBETA\ngamma");
      // beta -> removed, BETA -> added, alpha and gamma unchanged
      const types = result.map((l) => l.type);
      expect(types).toContain("added");
      expect(types).toContain("removed");
      expect(types).toContain("unchanged");
    });

    it("should handle completely different texts", () => {
      const result = computeDiff("aaa\nbbb", "xxx\nyyy");
      // All original lines removed, all modified lines added
      const removedCount = result.filter((l) => l.type === "removed").length;
      const addedCount = result.filter((l) => l.type === "added").length;
      expect(removedCount).toBe(2);
      expect(addedCount).toBe(2);
    });

    it("should handle single line texts", () => {
      const result = computeDiff("hello", "hello");
      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe("unchanged");
      expect(result[0]?.content).toBe("hello");
    });

    it("should handle single line change", () => {
      const result = computeDiff("old", "new");
      expect(result).toHaveLength(2);
      const types = result.map((l) => l.type);
      expect(types).toContain("removed");
      expect(types).toContain("added");
    });

    it("should set correct line numbers for unchanged lines", () => {
      const result = computeDiff("a\nb\nc", "a\nb\nc");
      expect(result[0]?.lineNumber).toEqual({ old: 1, new: 1 });
      expect(result[1]?.lineNumber).toEqual({ old: 2, new: 2 });
      expect(result[2]?.lineNumber).toEqual({ old: 3, new: 3 });
    });

    it("should set null line numbers for added lines (old is null)", () => {
      const result = computeDiff("", "new line");
      expect(result[0]?.lineNumber.old).toBeNull();
      expect(result[0]?.lineNumber.new).toBe(1);
    });

    it("should set null line numbers for removed lines (new is null)", () => {
      const result = computeDiff("old line", "");
      expect(result[0]?.lineNumber.new).toBeNull();
      expect(result[0]?.lineNumber.old).toBe(1);
    });

    it("should handle trailing newlines correctly", () => {
      const result = computeDiff("line1\n", "line1\n");
      // "line1\n" splits to ["line1", ""] — two elements
      expect(result).toHaveLength(2);
      expect(result[0]?.type).toBe("unchanged");
      expect(result[1]?.type).toBe("unchanged");
      expect(result[1]?.content).toBe("");
    });

    it("should handle texts with only whitespace differences", () => {
      const result = computeDiff("  hello", "hello");
      // Different lines — one removed, one added
      const removedCount = result.filter((l) => l.type === "removed").length;
      const addedCount = result.filter((l) => l.type === "added").length;
      expect(removedCount).toBe(1);
      expect(addedCount).toBe(1);
    });
  });

  // ─── getDiffStats ───

  describe("getDiffStats", () => {
    it("should return all zeros for empty lines", () => {
      const stats = getDiffStats([]);
      expect(stats).toEqual({ added: 0, removed: 0, unchanged: 0, total: 0 });
    });

    it("should count added lines correctly", () => {
      const lines = [
        { type: "added" as const, content: "a", lineNumber: { old: null, new: 1 } },
        { type: "added" as const, content: "b", lineNumber: { old: null, new: 2 } },
      ];
      const stats = getDiffStats(lines);
      expect(stats.added).toBe(2);
      expect(stats.removed).toBe(0);
      expect(stats.unchanged).toBe(0);
      expect(stats.total).toBe(2);
    });

    it("should count removed lines correctly", () => {
      const lines = [
        { type: "removed" as const, content: "x", lineNumber: { old: 1, new: null } },
      ];
      const stats = getDiffStats(lines);
      expect(stats.removed).toBe(1);
      expect(stats.total).toBe(1);
    });

    it("should count mixed types correctly", () => {
      const lines = [
        { type: "unchanged" as const, content: "a", lineNumber: { old: 1, new: 1 } },
        { type: "removed" as const, content: "b", lineNumber: { old: 2, new: null } },
        { type: "added" as const, content: "c", lineNumber: { old: null, new: 2 } },
        { type: "unchanged" as const, content: "d", lineNumber: { old: 3, new: 3 } },
      ];
      const stats = getDiffStats(lines);
      expect(stats.added).toBe(1);
      expect(stats.removed).toBe(1);
      expect(stats.unchanged).toBe(2);
      expect(stats.total).toBe(4);
    });
  });

  // ─── processDiff ───

  describe("processDiff", () => {
    it("should return a valid DiffResult with id", () => {
      vi.stubGlobal("crypto", { randomUUID: () => "test-uuid-1234" });
      const result = processDiff("hello", "world");
      expect(result.id).toBe("test-uuid-1234");
      expect(result.original).toBe("hello");
      expect(result.modified).toBe("world");
      expect(result.lines.length).toBeGreaterThan(0);
      expect(result.stats).toBeDefined();
      expect(result.timestamp).toBeDefined();
      vi.unstubAllGlobals();
    });

    it("should include correct stats in result", () => {
      const result = processDiff("a\nb", "a\nc");
      expect(result.stats.unchanged).toBe(1); // "a"
      expect(result.stats.removed).toBe(1); // "b"
      expect(result.stats.added).toBe(1); // "c"
      expect(result.stats.total).toBe(3);
    });

    it("should return zero-change stats for identical input", () => {
      const result = processDiff("same\ntext", "same\ntext");
      expect(result.stats.added).toBe(0);
      expect(result.stats.removed).toBe(0);
      expect(result.stats.unchanged).toBe(2);
    });

    it("should include ISO timestamp", () => {
      const result = processDiff("a", "b");
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  // ─── formatUnifiedDiff ───

  describe("formatUnifiedDiff", () => {
    it("should return empty string for no lines", () => {
      expect(formatUnifiedDiff([])).toBe("");
    });

    it("should prefix added lines with +", () => {
      const lines = [
        { type: "added" as const, content: "new line", lineNumber: { old: null, new: 1 } },
      ];
      expect(formatUnifiedDiff(lines)).toBe("+ new line");
    });

    it("should prefix removed lines with -", () => {
      const lines = [
        { type: "removed" as const, content: "old line", lineNumber: { old: 1, new: null } },
      ];
      expect(formatUnifiedDiff(lines)).toBe("- old line");
    });

    it("should prefix unchanged lines with two spaces", () => {
      const lines = [
        { type: "unchanged" as const, content: "same", lineNumber: { old: 1, new: 1 } },
      ];
      expect(formatUnifiedDiff(lines)).toBe("  same");
    });

    it("should format multiple lines correctly", () => {
      const lines = [
        { type: "unchanged" as const, content: "alpha", lineNumber: { old: 1, new: 1 } },
        { type: "removed" as const, content: "beta", lineNumber: { old: 2, new: null } },
        { type: "added" as const, content: "BETA", lineNumber: { old: null, new: 2 } },
        { type: "unchanged" as const, content: "gamma", lineNumber: { old: 3, new: 3 } },
      ];
      const formatted = formatUnifiedDiff(lines);
      expect(formatted).toBe("  alpha\n- beta\n+ BETA\n  gamma");
    });

    it("should handle lines with empty content", () => {
      const lines = [
        { type: "unchanged" as const, content: "", lineNumber: { old: 1, new: 1 } },
      ];
      expect(formatUnifiedDiff(lines)).toBe("  ");
    });
  });

  // ─── Edge cases ───

  describe("edge cases", () => {
    it("should handle large identical texts efficiently", () => {
      const lines = Array.from({ length: 200 }, (_, i) => `line ${i}`).join("\n");
      const result = computeDiff(lines, lines);
      expect(result).toHaveLength(200);
      expect(result.every((l) => l.type === "unchanged")).toBe(true);
    });

    it("should handle texts with special characters", () => {
      const result = computeDiff("hello <world> & \"foo\"", "hello <world> & \"bar\"");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle multiline additions at the end", () => {
      const result = computeDiff("line1", "line1\nline2\nline3");
      const added = result.filter((l) => l.type === "added");
      expect(added).toHaveLength(2);
      expect(added[0]?.content).toBe("line2");
      expect(added[1]?.content).toBe("line3");
    });

    it("should handle multiline removals at the start", () => {
      const result = computeDiff("line1\nline2\nline3", "line3");
      const removed = result.filter((l) => l.type === "removed");
      expect(removed).toHaveLength(2);
      expect(removed[0]?.content).toBe("line1");
      expect(removed[1]?.content).toBe("line2");
    });
  });
});
