import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  encodeState,
  decodeState,
  buildShareUrl,
  getShareHash,
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

  // ─── getShareHash ───

  describe("getShareHash", () => {
    const originalLocation = window.location;

    afterEach(() => {
      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
        configurable: true,
      });
    });

    it("should return null when hash is empty", () => {
      Object.defineProperty(window, "location", {
        value: { hash: "" },
        writable: true,
        configurable: true,
      });
      expect(getShareHash()).toBeNull();
    });

    it("should return null when hash is just '#'", () => {
      Object.defineProperty(window, "location", {
        value: { hash: "#" },
        writable: true,
        configurable: true,
      });
      expect(getShareHash()).toBeNull();
    });

    it("should return null for short hash '#ab' (length < 4)", () => {
      Object.defineProperty(window, "location", {
        value: { hash: "#ab" },
        writable: true,
        configurable: true,
      });
      expect(getShareHash()).toBeNull();
    });

    it("should return hash content without '#' for valid compressed hash", () => {
      Object.defineProperty(window, "location", {
        value: { hash: "#c.abc123" },
        writable: true,
        configurable: true,
      });
      expect(getShareHash()).toBe("c.abc123");
    });

    it("should return hash content without '#' for valid plain hash", () => {
      Object.defineProperty(window, "location", {
        value: { hash: "#p.somedata" },
        writable: true,
        configurable: true,
      });
      expect(getShareHash()).toBe("p.somedata");
    });

    it("should return hash content for minimum valid length '#abc' (length === 4)", () => {
      Object.defineProperty(window, "location", {
        value: { hash: "#abc" },
        writable: true,
        configurable: true,
      });
      expect(getShareHash()).toBe("abc");
    });
  });

  // ─── Plain encoding fallback (no CompressionStream) ───

  describe("plain encoding fallback", () => {
    let originalCS: typeof globalThis.CompressionStream;
    let originalDS: typeof globalThis.DecompressionStream;

    beforeEach(() => {
      originalCS = globalThis.CompressionStream;
      originalDS = globalThis.DecompressionStream;
      globalThis.CompressionStream = undefined as unknown as typeof CompressionStream;
      globalThis.DecompressionStream = undefined as unknown as typeof DecompressionStream;
    });

    afterEach(() => {
      globalThis.CompressionStream = originalCS;
      globalThis.DecompressionStream = originalDS;
    });

    it("should produce 'p.' prefix when CompressionStream is unavailable", async () => {
      const encoded = await encodeState("test-tool", { key: "value" });
      expect(encoded.startsWith("p.")).toBe(true);
    });

    it("should round-trip correctly with plain encoding", async () => {
      const state = { input: "hello world", mode: "encode" };
      const encoded = await encodeState("base64", state);
      expect(encoded.startsWith("p.")).toBe(true);

      const decoded = await decodeState(encoded);
      expect(decoded).not.toBeNull();
      expect(decoded?.tool).toBe("base64");
      expect(decoded?.state["input"]).toBe("hello world");
      expect(decoded?.state["mode"]).toBe("encode");
      expect(decoded?.v).toBe(1);
    });

    it("should handle Unicode with plain encoding", async () => {
      const state = { text: "café ☕ 日本" };
      const encoded = await encodeState("unicode-tool", state);
      expect(encoded.startsWith("p.")).toBe(true);

      const decoded = await decodeState(encoded);
      expect(decoded?.state["text"]).toBe("café ☕ 日本");
    });
  });

  // ─── Compressed path with working stream mocks ───

  describe("compressed encoding with working stream mocks", () => {
    let originalCS: typeof globalThis.CompressionStream | undefined;
    let originalDS: typeof globalThis.DecompressionStream | undefined;
    let originalBlobStream: typeof Blob.prototype.stream | undefined;

    beforeEach(() => {
      originalCS = globalThis.CompressionStream;
      originalDS = globalThis.DecompressionStream;
      originalBlobStream = Blob.prototype.stream;

      // Patch Blob.prototype.stream to return a proper ReadableStream
      Blob.prototype.stream = function (this: Blob) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const blob = this;
        return new ReadableStream({
          async start(controller) {
            const ab = await blob.arrayBuffer();
            controller.enqueue(new Uint8Array(ab));
            controller.close();
          },
        });
      } as typeof Blob.prototype.stream;

      // Identity transform (pass-through) compression/decompression mocks
      class MockCompressionStream {
        readable: ReadableStream<Uint8Array>;
        writable: WritableStream<Uint8Array>;
        constructor(_format: string) {
          const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
          this.readable = readable;
          this.writable = writable;
        }
      }

      class MockDecompressionStream {
        readable: ReadableStream<Uint8Array>;
        writable: WritableStream<Uint8Array>;
        constructor(_format: string) {
          const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
          this.readable = readable;
          this.writable = writable;
        }
      }

      globalThis.CompressionStream = MockCompressionStream as unknown as typeof CompressionStream;
      globalThis.DecompressionStream = MockDecompressionStream as unknown as typeof DecompressionStream;
    });

    afterEach(() => {
      if (originalCS !== undefined) {
        globalThis.CompressionStream = originalCS;
      } else {
        delete (globalThis as Record<string, unknown>)["CompressionStream"];
      }
      if (originalDS !== undefined) {
        globalThis.DecompressionStream = originalDS;
      } else {
        delete (globalThis as Record<string, unknown>)["DecompressionStream"];
      }
      if (originalBlobStream !== undefined) {
        Blob.prototype.stream = originalBlobStream;
      }
    });

    it("should produce 'c.' prefix with working CompressionStream", async () => {
      const encoded = await encodeState("test", { key: "value" });
      expect(encoded.startsWith("c.")).toBe(true);
    });

    it("should round-trip through compressed encode/decode", async () => {
      const state = { input: "compressed test", mode: "format" };
      const encoded = await encodeState("json-formatter", state);
      expect(encoded.startsWith("c.")).toBe(true);

      const decoded = await decodeState(encoded);
      expect(decoded).not.toBeNull();
      expect(decoded?.tool).toBe("json-formatter");
      expect(decoded?.state["input"]).toBe("compressed test");
      expect(decoded?.state["mode"]).toBe("format");
      expect(decoded?.v).toBe(1);
    });

    it("should produce URL-safe compressed output", async () => {
      const encoded = await encodeState("test", { data: "hello world" });
      const data = encoded.slice(2);
      expect(/^[A-Za-z0-9_-]*$/.test(data)).toBe(true);
    });

    it("should handle Unicode through compressed path", async () => {
      const state = { text: "héllo 🌍 日本語" };
      const encoded = await encodeState("unicode", state);
      expect(encoded.startsWith("c.")).toBe(true);

      const decoded = await decodeState(encoded);
      expect(decoded?.state["text"]).toBe("héllo 🌍 日本語");
    });

    it("should handle empty state through compressed path", async () => {
      const encoded = await encodeState("empty", {});
      expect(encoded.startsWith("c.")).toBe(true);

      const decoded = await decodeState(encoded);
      expect(decoded?.tool).toBe("empty");
      expect(decoded?.state).toEqual({});
    });
  });

  // ─── Compression error fallback ───

  describe("compression error fallback", () => {
    let originalCS: typeof globalThis.CompressionStream | undefined;
    let originalDS: typeof globalThis.DecompressionStream | undefined;

    beforeEach(() => {
      originalCS = globalThis.CompressionStream;
      originalDS = globalThis.DecompressionStream;
    });

    afterEach(() => {
      if (originalCS !== undefined) {
        globalThis.CompressionStream = originalCS;
      } else {
        delete (globalThis as Record<string, unknown>)["CompressionStream"];
      }
      if (originalDS !== undefined) {
        globalThis.DecompressionStream = originalDS;
      } else {
        delete (globalThis as Record<string, unknown>)["DecompressionStream"];
      }
    });

    it("should fall back to plain encoding when compression constructor throws", async () => {
      class BrokenCompressionStream {
        readable: ReadableStream;
        writable: WritableStream;
        constructor() {
          throw new Error("Compression not supported");
        }
      }

      globalThis.CompressionStream = BrokenCompressionStream as unknown as typeof CompressionStream;

      const encoded = await encodeState("test", { key: "value" });
      expect(encoded.startsWith("p.")).toBe(true);

      const decoded = await decodeState(encoded);
      expect(decoded?.tool).toBe("test");
      expect(decoded?.state["key"]).toBe("value");
    });

    it("should return null when decoding c. prefix with broken DecompressionStream", async () => {
      class BrokenDecompressionStream {
        readable: ReadableStream;
        writable: WritableStream;
        constructor() {
          throw new Error("Decompression failed");
        }
      }

      globalThis.DecompressionStream = BrokenDecompressionStream as unknown as typeof DecompressionStream;

      const result = await decodeState("c.SGVsbG8gV29ybGQ");
      expect(result).toBeNull();
    });

    it("should return null when decoding c. prefix with corrupt data", async () => {
      const result = await decodeState("c.dGhpcyBpcyBub3QgZ3ppcA");
      expect(result).toBeNull();
    });

    it("should return null for c. prefix with empty data after prefix", async () => {
      const result = await decodeState("c.");
      expect(result).toBeNull();
    });
  });

  // ─── decodeState with null/invalid state field ───

  describe("decodeState with null/invalid state field", () => {
    function plainEncode(obj: unknown): string {
      const json = JSON.stringify(obj);
      const bytes = new TextEncoder().encode(json);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]!);
      }
      return "p." + btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    }

    it("should return null when state is null", async () => {
      const encoded = plainEncode({ tool: "test", state: null, v: 1 });
      expect(await decodeState(encoded)).toBeNull();
    });

    it("should return null when state is a string instead of object", async () => {
      const encoded = plainEncode({ tool: "test", state: "not-an-object", v: 1 });
      expect(await decodeState(encoded)).toBeNull();
    });

    it("should return null when state is a number", async () => {
      const encoded = plainEncode({ tool: "test", state: 42, v: 1 });
      expect(await decodeState(encoded)).toBeNull();
    });

    it("should return null when tool is not a string", async () => {
      const encoded = plainEncode({ tool: true, state: {}, v: 1 });
      expect(await decodeState(encoded)).toBeNull();
    });
  });
});
