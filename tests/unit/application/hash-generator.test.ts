import { describe, it, expect } from "vitest";
import {
  generateHash,
  generateAllHashes,
  generateHmac,
  detectHashType,
  compareHashes,
  processHash,
  generateFileHash,
} from "@/lib/application/hash-generator";

describe("hash-generator", () => {
  // ─── generateHash ───

  describe("generateHash", () => {
    it("should generate MD5 hash", async () => {
      const hash = await generateHash("hello", { algorithm: "md5", outputFormat: "hex" });
      expect(hash).toBe("5d41402abc4b2a76b9719d911017c592");
    });

    it("should generate SHA-1 hash", async () => {
      const hash = await generateHash("hello", { algorithm: "sha1", outputFormat: "hex" });
      expect(hash).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
    });

    it("should generate SHA-256 hash", async () => {
      const hash = await generateHash("hello", { algorithm: "sha256", outputFormat: "hex" });
      expect(hash).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
    });

    it("should generate SHA-384 hash", async () => {
      const hash = await generateHash("hello", { algorithm: "sha384", outputFormat: "hex" });
      expect(hash).toHaveLength(96);
    });

    it("should generate SHA-512 hash", async () => {
      const hash = await generateHash("hello", { algorithm: "sha512", outputFormat: "hex" });
      expect(hash).toHaveLength(128);
    });

    it("should return empty string for empty input", async () => {
      const hash = await generateHash("", { algorithm: "sha256", outputFormat: "hex" });
      expect(hash).toBe("");
    });

    it("should generate uppercase hex output", async () => {
      const hash = await generateHash("hello", { algorithm: "sha256", outputFormat: "uppercase-hex" });
      expect(hash).toMatch(/^[0-9A-F]+$/);
      expect(hash).toHaveLength(64);
    });

    it("should generate base64 output for SHA-256", async () => {
      const hash = await generateHash("hello", { algorithm: "sha256", outputFormat: "base64" });
      expect(hash).toBeTruthy();
      // Base64 should not contain hex-only chars (it has +, /, =)
      expect(hash.length).toBeLessThan(64);
    });

    it("should generate base64 output for MD5", async () => {
      const hash = await generateHash("hello", { algorithm: "md5", outputFormat: "base64" });
      expect(hash).toBeTruthy();
    });

    it("should generate uppercase hex for MD5", async () => {
      const hash = await generateHash("hello", { algorithm: "md5", outputFormat: "uppercase-hex" });
      expect(hash).toBe("5D41402ABC4B2A76B9719D911017C592");
    });

    it("should handle Unicode input", async () => {
      const hash = await generateHash("héllo wörld 🌍", { algorithm: "sha256", outputFormat: "hex" });
      expect(hash).toHaveLength(64);
    });

    it("should use default config when not provided", async () => {
      const hash = await generateHash("test");
      expect(hash).toHaveLength(64); // SHA-256 hex
    });
  });

  // ─── generateHmac ───

  describe("generateHmac", () => {
    it("should generate HMAC-SHA256", async () => {
      const hmac = await generateHmac("hello", {
        algorithm: "sha256",
        key: "secret",
        outputFormat: "hex",
      });
      expect(hmac).toHaveLength(64);
      expect(hmac).toBeTruthy();
    });

    it("should return empty string for empty input", async () => {
      const hmac = await generateHmac("", {
        algorithm: "sha256",
        key: "secret",
        outputFormat: "hex",
      });
      expect(hmac).toBe("");
    });

    it("should return empty string for empty key", async () => {
      const hmac = await generateHmac("hello", {
        algorithm: "sha256",
        key: "",
        outputFormat: "hex",
      });
      expect(hmac).toBe("");
    });

    it("should generate different HMAC for different keys", async () => {
      const hmac1 = await generateHmac("hello", {
        algorithm: "sha256",
        key: "key1",
        outputFormat: "hex",
      });
      const hmac2 = await generateHmac("hello", {
        algorithm: "sha256",
        key: "key2",
        outputFormat: "hex",
      });
      expect(hmac1).not.toBe(hmac2);
    });
  });

  // ─── generateFileHash ───

  describe("generateFileHash", () => {
    it("should hash an ArrayBuffer with SHA-256", async () => {
      const encoder = new TextEncoder();
      const buffer = encoder.encode("hello").buffer as ArrayBuffer;
      const hash = await generateFileHash(buffer, "sha256");
      expect(hash).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
    });

    it("should hash an ArrayBuffer with MD5", async () => {
      const encoder = new TextEncoder();
      const buffer = encoder.encode("hello").buffer as ArrayBuffer;
      const hash = await generateFileHash(buffer, "md5");
      expect(hash).toHaveLength(32);
    });
  });

  // ─── detectHashType ───

  describe("detectHashType", () => {
    it("should detect MD5 hash (32 hex chars)", () => {
      const result = detectHashType("5d41402abc4b2a76b9719d911017c592");
      expect(result.possibleAlgorithms).toContain("md5");
      expect(result.isHex).toBe(true);
      expect(result.length).toBe(32);
    });

    it("should detect SHA-1 hash (40 hex chars)", () => {
      const result = detectHashType("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
      expect(result.possibleAlgorithms).toContain("sha1");
    });

    it("should detect SHA-256 hash (64 hex chars)", () => {
      const result = detectHashType("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
      expect(result.possibleAlgorithms).toContain("sha256");
    });

    it("should detect SHA-384 hash (96 hex chars)", () => {
      const result = detectHashType("a".repeat(96));
      expect(result.possibleAlgorithms).toContain("sha384");
    });

    it("should detect SHA-512 hash (128 hex chars)", () => {
      const result = detectHashType("a".repeat(128));
      expect(result.possibleAlgorithms).toContain("sha512");
    });

    it("should return empty array for non-hex strings", () => {
      const result = detectHashType("not-a-hash!");
      expect(result.possibleAlgorithms).toEqual([]);
      expect(result.isHex).toBe(false);
    });

    it("should return empty array for wrong length hex", () => {
      const result = detectHashType("abc123");
      expect(result.possibleAlgorithms).toEqual([]);
      expect(result.isHex).toBe(true);
    });

    it("should handle whitespace in input", () => {
      const result = detectHashType("  5d41402abc4b2a76b9719d911017c592  ");
      expect(result.possibleAlgorithms).toContain("md5");
    });
  });

  // ─── compareHashes ───

  describe("compareHashes", () => {
    it("should return true for identical hashes", () => {
      expect(compareHashes("abc123", "abc123")).toBe(true);
    });

    it("should return true for case-insensitive match", () => {
      expect(compareHashes("ABC123", "abc123")).toBe(true);
    });

    it("should return false for different hashes", () => {
      expect(compareHashes("abc123", "def456")).toBe(false);
    });

    it("should return false for different length hashes", () => {
      expect(compareHashes("abc", "abcd")).toBe(false);
    });

    it("should handle whitespace", () => {
      expect(compareHashes(" abc123 ", "abc123")).toBe(true);
    });
  });

  // ─── generateAllHashes ───

  describe("generateAllHashes", () => {
    it("should return hashes for all 5 algorithms", async () => {
      const result = await generateAllHashes("hello");
      expect(Object.keys(result)).toHaveLength(5);
      expect(result["md5"]).toHaveLength(32);
      expect(result["sha1"]).toHaveLength(40);
      expect(result["sha256"]).toHaveLength(64);
      expect(result["sha384"]).toHaveLength(96);
      expect(result["sha512"]).toHaveLength(128);
    });
  });

  // ─── processHash ───

  describe("processHash", () => {
    it("should return a full HashResult", async () => {
      const result = await processHash("hello", { algorithm: "sha256", outputFormat: "hex" });
      expect(result.id).toBeTruthy();
      expect(result.input).toBe("hello");
      expect(result.hash).toHaveLength(64);
      expect(result.algorithm).toBe("sha256");
      expect(result.outputFormat).toBe("hex");
      expect(result.timestamp).toBeTruthy();
    });
  });
});
