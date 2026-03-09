import { describe, it, expect } from "vitest";
import {
  encodeState,
  decodeState,
  buildShareUrl,
  isShareSafe,
  MAX_SHARE_LENGTH,
} from "@/lib/application/share-state";

describe("share-state", () => {
  // ─── encodeState / decodeState round-trip ───

  describe("encode/decode round-trip", () => {
    it("should encode and decode simple state", async () => {
      const encoded = await encodeState("json-formatter", { input: "hello" });
      expect(encoded).toBeTruthy();
      expect(encoded.length).toBeGreaterThan(0);

      const decoded = await decodeState(encoded);
      expect(decoded).not.toBeNull();
      expect(decoded?.tool).toBe("json-formatter");
      expect(decoded?.state["input"]).toBe("hello");
      expect(decoded?.v).toBe(1);
    });

    it("should encode and decode complex state", async () => {
      const state = {
        input: '{"foo": "bar", "nested": {"a": 1}}',
        mode: "format",
        indent: "2",
      };
      const encoded = await encodeState("json-formatter", state);
      const decoded = await decodeState(encoded);

      expect(decoded?.tool).toBe("json-formatter");
      expect(decoded?.state["input"]).toBe(state.input);
      expect(decoded?.state["mode"]).toBe("format");
      expect(decoded?.state["indent"]).toBe("2");
    });

    it("should handle empty state", async () => {
      const encoded = await encodeState("base64", {});
      const decoded = await decodeState(encoded);
      expect(decoded?.tool).toBe("base64");
      expect(decoded?.state).toEqual({});
    });

    it("should handle Unicode in state values", async () => {
      const state = { input: "héllo wörld 🌍 日本語" };
      const encoded = await encodeState("hash-generator", state);
      const decoded = await decodeState(encoded);
      expect(decoded?.state["input"]).toBe("héllo wörld 🌍 日本語");
    });

    it("should handle large state values", async () => {
      const largeInput = "x".repeat(2000);
      const encoded = await encodeState("diff-comparer", { input: largeInput });
      const decoded = await decodeState(encoded);
      expect(decoded?.state["input"]).toBe(largeInput);
    });

    it("should handle special characters in state", async () => {
      const state = {
        input: 'const x = "hello"; // comment\n// line2',
        regex: "^[a-z]+$",
      };
      const encoded = await encodeState("regex-humanizer", state);
      const decoded = await decodeState(encoded);
      expect(decoded?.state["input"]).toBe(state.input);
      expect(decoded?.state["regex"]).toBe(state.regex);
    });
  });

  // ─── encodeState format ───

  describe("encodeState format", () => {
    it("should start with 'c.' or 'p.' prefix", async () => {
      const encoded = await encodeState("test", { a: "b" });
      expect(encoded.startsWith("c.") || encoded.startsWith("p.")).toBe(true);
    });

    it("should produce URL-safe characters only", async () => {
      const encoded = await encodeState("test", { input: "hello world" });
      // After the prefix, should only have base64url chars
      const data = encoded.slice(2);
      expect(/^[A-Za-z0-9_-]*$/.test(data)).toBe(true);
    });
  });

  // ─── decodeState error handling ───

  describe("decodeState error handling", () => {
    it("should return null for empty string", async () => {
      expect(await decodeState("")).toBeNull();
    });

    it("should return null for too-short string", async () => {
      expect(await decodeState("ab")).toBeNull();
    });

    it("should return null for unknown prefix", async () => {
      expect(await decodeState("x.abc123")).toBeNull();
    });

    it("should return null for invalid base64", async () => {
      expect(await decodeState("p.!!!invalid!!!")).toBeNull();
    });

    it("should return null for valid base64 but invalid JSON", async () => {
      const encoded = "p." + btoa("not json").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      expect(await decodeState(encoded)).toBeNull();
    });

    it("should return null for valid JSON but missing fields", async () => {
      const encoded = "p." + btoa('{"foo":"bar"}').replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      expect(await decodeState(encoded)).toBeNull();
    });

    it("should return null for payload with wrong types", async () => {
      const encoded = "p." + btoa('{"tool":123,"state":{},"v":1}').replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      expect(await decodeState(encoded)).toBeNull();
    });
  });

  // ─── buildShareUrl ───

  describe("buildShareUrl", () => {
    it("should build a valid URL with hash", () => {
      const url = buildShareUrl("https://devflowai.vercel.app/tools/json-formatter", "c.abc123");
      expect(url).toBe("https://devflowai.vercel.app/tools/json-formatter#c.abc123");
    });

    it("should replace existing hash", () => {
      const url = buildShareUrl("https://example.com/tools/base64#old", "p.new");
      expect(url).toContain("#p.new");
    });
  });

  // ─── isShareSafe ───

  describe("isShareSafe", () => {
    it("should return true for short strings", () => {
      expect(isShareSafe("c.abc")).toBe(true);
    });

    it("should return false for strings exceeding MAX_SHARE_LENGTH", () => {
      const long = "c." + "x".repeat(MAX_SHARE_LENGTH);
      expect(isShareSafe(long)).toBe(false);
    });

    it("should return true at exactly MAX_SHARE_LENGTH", () => {
      const exact = "x".repeat(MAX_SHARE_LENGTH);
      expect(isShareSafe(exact)).toBe(true);
    });
  });
});
