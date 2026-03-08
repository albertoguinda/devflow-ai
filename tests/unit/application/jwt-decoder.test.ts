import { describe, it, expect } from "vitest";
import {
  decodeJwt,
  validateJwt,
  isExpired,
  isNotYetValid,
  getExpiresIn,
  formatClaims,
  processJwt,
  isJwtLike,
} from "@/lib/application/jwt-decoder";

// Test JWT: header.payload.signature
// Header: {"alg":"HS256","typ":"JWT"}
// Payload: {"sub":"1234567890","name":"John Doe","iat":1516239022}
const TEST_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

// Expired JWT (exp: 1000000000 = 2001-09-09)
const EXPIRED_TOKEN = (() => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const payload = btoa(JSON.stringify({ sub: "test", exp: 1000000000, iat: 999999000 }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${header}.${payload}.dGVzdHNpZw`;
})();

// Future JWT (exp: 9999999999 = 2286-11-20)
const FUTURE_TOKEN = (() => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const payload = btoa(JSON.stringify({ sub: "test", exp: 9999999999, iat: 1700000000 }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${header}.${payload}.dGVzdHNpZw`;
})();

// Token with nbf in the future
const NOT_YET_VALID_TOKEN = (() => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const payload = btoa(JSON.stringify({ sub: "test", nbf: 9999999999 }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${header}.${payload}.dGVzdHNpZw`;
})();

describe("jwt-decoder", () => {
  // ─── decodeJwt ───

  describe("decodeJwt", () => {
    it("should decode a valid JWT into three parts", () => {
      const result = decodeJwt(TEST_TOKEN);
      expect(result.header).toEqual({ alg: "HS256", typ: "JWT" });
      expect(result.payload).toEqual({
        sub: "1234567890",
        name: "John Doe",
        iat: 1516239022,
      });
      expect(result.signature).toBeTruthy();
    });

    it("should preserve raw parts", () => {
      const result = decodeJwt(TEST_TOKEN);
      expect(result.raw.header).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
      expect(result.raw.payload).toBe("eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ");
    });

    it("should throw on empty string", () => {
      expect(() => decodeJwt("")).toThrow("Empty token");
    });

    it("should throw on invalid structure (not 3 parts)", () => {
      expect(() => decodeJwt("abc.def")).toThrow("Invalid JWT structure");
    });

    it("should throw on invalid base64 in header", () => {
      expect(() => decodeJwt("!!!.eyJ0ZXN0IjoxfQ.sig")).toThrow();
    });

    it("should handle whitespace around token", () => {
      const result = decodeJwt(`  ${TEST_TOKEN}  `);
      expect(result.header).toEqual({ alg: "HS256", typ: "JWT" });
    });
  });

  // ─── isExpired ───

  describe("isExpired", () => {
    it("should return true for expired token", () => {
      expect(isExpired({ exp: 1000000000 })).toBe(true);
    });

    it("should return false for future token", () => {
      expect(isExpired({ exp: 9999999999 })).toBe(false);
    });

    it("should return false when no exp claim", () => {
      expect(isExpired({ sub: "test" })).toBe(false);
    });

    it("should return false when exp is not a number", () => {
      expect(isExpired({ exp: "not-a-number" })).toBe(false);
    });
  });

  // ─── isNotYetValid ───

  describe("isNotYetValid", () => {
    it("should return true when nbf is in the future", () => {
      expect(isNotYetValid({ nbf: 9999999999 })).toBe(true);
    });

    it("should return false when nbf is in the past", () => {
      expect(isNotYetValid({ nbf: 1000000000 })).toBe(false);
    });

    it("should return false when no nbf claim", () => {
      expect(isNotYetValid({ sub: "test" })).toBe(false);
    });
  });

  // ─── getExpiresIn ───

  describe("getExpiresIn", () => {
    it("should return null when no exp claim", () => {
      expect(getExpiresIn({ sub: "test" })).toBeNull();
    });

    it("should indicate expired for past exp", () => {
      const result = getExpiresIn({ exp: 1000000000 });
      expect(result).toContain("Expired");
      expect(result).toContain("ago");
    });

    it("should indicate expires in for future exp", () => {
      const result = getExpiresIn({ exp: 9999999999 });
      expect(result).toContain("Expires in");
    });
  });

  // ─── validateJwt ───

  describe("validateJwt", () => {
    it("should validate a valid non-expired token", () => {
      const parts = decodeJwt(FUTURE_TOKEN);
      const validation = validateJwt(parts);
      expect(validation.isValid).toBe(true);
      expect(validation.isExpired).toBe(false);
      expect(validation.algorithm).toBe("HS256");
      expect(validation.errors).toHaveLength(0);
    });

    it("should detect expired token", () => {
      const parts = decodeJwt(EXPIRED_TOKEN);
      const validation = validateJwt(parts);
      expect(validation.isExpired).toBe(true);
      expect(validation.errors).toContain("Token is expired");
    });

    it("should detect not-yet-valid token", () => {
      const parts = decodeJwt(NOT_YET_VALID_TOKEN);
      const validation = validateJwt(parts);
      expect(validation.isNotYetValid).toBe(true);
      expect(validation.errors.some((e) => e.includes("not yet valid"))).toBe(true);
    });

    it("should warn about alg:none", () => {
      // Build token with empty sig manually
      const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      const payload = btoa(JSON.stringify({ sub: "test" }))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      const parts = decodeJwt(`${header}.${payload}.x`);
      const validation = validateJwt(parts);
      expect(validation.errors.some((e) => e.includes("none"))).toBe(true);
    });

    it("should extract issuer and subject", () => {
      const parts = decodeJwt(TEST_TOKEN);
      const validation = validateJwt(parts);
      expect(validation.subject).toBe("1234567890");
    });

    it("should format timestamps", () => {
      const parts = decodeJwt(EXPIRED_TOKEN);
      const validation = validateJwt(parts);
      expect(validation.expiresAt).toBeTruthy();
      expect(validation.issuedAt).toBeTruthy();
    });
  });

  // ─── formatClaims ───

  describe("formatClaims", () => {
    it("should annotate standard claims", () => {
      const claims = formatClaims({ sub: "user123", iss: "auth0", custom_field: "value" });
      const subClaim = claims.find((c) => c.key === "sub");
      expect(subClaim?.type).toBe("standard");
      expect(subClaim?.label).toBe("Subject");
    });

    it("should mark custom claims", () => {
      const claims = formatClaims({ custom_field: "value" });
      expect(claims[0]?.type).toBe("custom");
    });

    it("should sort standard claims before custom", () => {
      const claims = formatClaims({ z_custom: "1", sub: "user", a_custom: "2" });
      expect(claims[0]?.key).toBe("sub");
      expect(claims[1]?.key).toBe("a_custom");
    });

    it("should mark expired exp claim with error status", () => {
      const claims = formatClaims({ exp: 1000000000 });
      const expClaim = claims.find((c) => c.key === "exp");
      expect(expClaim?.status).toBe("error");
    });

    it("should mark future nbf claim with warning status", () => {
      const claims = formatClaims({ nbf: 9999999999 });
      const nbfClaim = claims.find((c) => c.key === "nbf");
      expect(nbfClaim?.status).toBe("warning");
    });
  });

  // ─── processJwt ───

  describe("processJwt", () => {
    it("should return a full JwtResult", () => {
      const result = processJwt(TEST_TOKEN);
      expect(result.id).toBeTruthy();
      expect(result.token).toBe(TEST_TOKEN);
      expect(result.parts.header).toEqual({ alg: "HS256", typ: "JWT" });
      expect(result.validation).toBeTruthy();
      expect(result.claims.length).toBeGreaterThan(0);
      expect(result.timestamp).toBeTruthy();
    });
  });

  // ─── isJwtLike ───

  describe("isJwtLike", () => {
    it("should return true for JWT-like string", () => {
      expect(isJwtLike(TEST_TOKEN)).toBe(true);
    });

    it("should return false for plain text", () => {
      expect(isJwtLike("hello world")).toBe(false);
    });

    it("should return false for two-part string", () => {
      expect(isJwtLike("abc.def")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isJwtLike("")).toBe(false);
    });

    it("should return false for string with invalid base64url chars", () => {
      expect(isJwtLike("abc.d e f.ghi")).toBe(false);
    });
  });
});
