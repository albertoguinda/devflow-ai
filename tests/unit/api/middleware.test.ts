import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  getClientIP,
  extractBYOK,
  successResponse,
  errorResponse,
} from "@/lib/api/middleware";

// Mock rate limiter and env to avoid import issues
vi.mock("@/infrastructure/services/rate-limiter", () => ({
  getRateLimiter: vi.fn().mockReturnValue({
    checkLimit: vi.fn().mockReturnValue({
      allowed: true,
      remainingRequests: 10,
      remainingTokens: 500_000,
      retryAfterMs: null,
    }),
    recordRequest: vi.fn(),
    recordTokens: vi.fn(),
  }),
}));

vi.mock("@/infrastructure/config/env", () => ({
  getServerEnv: vi.fn().mockReturnValue({
    RATE_LIMIT_RPM: 10,
    RATE_LIMIT_DAILY_TOKENS: 500_000,
  }),
}));

function makeRequest(
  headers: Record<string, string> = {},
  body?: unknown,
): NextRequest {
  const url = "http://localhost:3000/api/ai/test";
  return new NextRequest(url, {
    method: "POST",
    headers: new Headers(headers),
    body: body !== undefined ? JSON.stringify(body) : null,
  });
}

describe("getClientIP", () => {
  it("should ignore x-real-ip when VERCEL env is not set", () => {
    const req = makeRequest({
      "x-real-ip": "10.0.0.1",
      "x-forwarded-for": "1.2.3.4, 5.6.7.8",
    });
    // Without VERCEL=1, x-real-ip is untrusted — falls through to x-forwarded-for
    expect(getClientIP(req)).toBe("5.6.7.8");
  });

  it("should prefer x-real-ip when VERCEL=1 is set", () => {
    process.env["VERCEL"] = "1";
    const req = makeRequest({
      "x-real-ip": "10.0.0.1",
      "x-forwarded-for": "1.2.3.4, 5.6.7.8",
    });
    expect(getClientIP(req)).toBe("10.0.0.1");
    delete process.env["VERCEL"];
  });

  it("should extract last IP from x-forwarded-for (proxy-set)", () => {
    const req = makeRequest({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIP(req)).toBe("5.6.7.8");
  });

  it("should handle single IP in x-forwarded-for", () => {
    const req = makeRequest({ "x-forwarded-for": "1.2.3.4" });
    expect(getClientIP(req)).toBe("1.2.3.4");
  });

  it("should fall through to x-forwarded-for when x-real-ip is untrusted", () => {
    const req = makeRequest({ "x-real-ip": "10.0.0.1" });
    // Without VERCEL=1, x-real-ip is not trusted and there's no x-forwarded-for
    expect(getClientIP(req)).toBe("127.0.0.1");
  });

  it("should default to 127.0.0.1 when no headers", () => {
    const req = makeRequest();
    expect(getClientIP(req)).toBe("127.0.0.1");
  });

  it("should handle empty x-forwarded-for with whitespace", () => {
    const req = makeRequest({ "x-forwarded-for": "  ,  , " });
    expect(getClientIP(req)).toBe("127.0.0.1");
  });

  it("should trim whitespace from IPs", () => {
    const req = makeRequest({ "x-forwarded-for": " 1.2.3.4 , 5.6.7.8 " });
    expect(getClientIP(req)).toBe("5.6.7.8");
  });

  it("should trust x-real-ip on Vercel and trim whitespace", () => {
    process.env["VERCEL"] = "1";
    const req = makeRequest({ "x-real-ip": " 10.0.0.1 " });
    expect(getClientIP(req)).toBe("10.0.0.1");
    delete process.env["VERCEL"];
  });
});

describe("extractBYOK", () => {
  it("should extract BYOK config from headers with valid key length", () => {
    const req = makeRequest({
      "x-devflow-api-key": "my-valid-api-key-that-is-long-enough",
      "x-devflow-provider": "gemini",
    });
    const byok = extractBYOK(req);
    expect(byok).toEqual({ key: "my-valid-api-key-that-is-long-enough", provider: "gemini" });
  });

  it("should reject BYOK with key shorter than 20 characters", () => {
    const req = makeRequest({
      "x-devflow-api-key": "short-key",
      "x-devflow-provider": "gemini",
    });
    expect(extractBYOK(req)).toBeUndefined();
  });

  it("should reject BYOK with pollinations provider", () => {
    const req = makeRequest({
      "x-devflow-api-key": "my-valid-api-key-that-is-long-enough",
      "x-devflow-provider": "pollinations",
    });
    expect(extractBYOK(req)).toBeUndefined();
  });

  it("should return undefined when headers are missing", () => {
    const req = makeRequest();
    expect(extractBYOK(req)).toBeUndefined();
  });

  it("should return undefined for invalid provider", () => {
    const req = makeRequest({
      "x-devflow-api-key": "key",
      "x-devflow-provider": "openai",
    });
    expect(extractBYOK(req)).toBeUndefined();
  });
});

describe("successResponse", () => {
  it("should wrap data in ApiResult format", async () => {
    const response = successResponse({ score: 85 });
    const body = await response.json();
    expect(body).toEqual({ data: { score: 85 }, error: null });
    expect(response.status).toBe(200);
  });
});

describe("errorResponse", () => {
  it("should return error with status code", async () => {
    const response = errorResponse("Not found", 404);
    const body = await response.json();
    expect(body).toEqual({ data: null, error: "Not found" });
    expect(response.status).toBe(404);
  });
});

describe("validateBody", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should validate and return parsed data", async () => {
    const { validateBody } = await import("@/lib/api/middleware");
    const { z } = await import("zod");
    const schema = z.object({ name: z.string() });

    const req = makeRequest(
      { "content-type": "application/json" },
      { name: "test" },
    );
    const result = await validateBody(req, schema);

    expect("data" in result).toBe(true);
    if ("data" in result) {
      expect(result.data).toEqual({ name: "test" });
    }
  });

  it("should return 400 for invalid data", async () => {
    const { validateBody } = await import("@/lib/api/middleware");
    const { z } = await import("zod");
    const schema = z.object({ name: z.string() });

    const req = makeRequest(
      { "content-type": "application/json" },
      { name: 123 },
    );
    const result = await validateBody(req, schema);

    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.status).toBe(400);
    }
  });
});
