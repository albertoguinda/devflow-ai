import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock NextResponse.json
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((body: unknown) => ({
      json: () => Promise.resolve(body),
    })),
  },
  NextRequest: class {},
}));

import { GET } from "@/app/api/ai/status/route";

describe("GET /api/ai/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("always reports configured = true (Pollinations fallback)", async () => {
    const response = await GET();
    const body = await response.json();
    expect(body.data.configured).toBe(true);
  });

  it("does not expose real provider name or rate limits", async () => {
    const response = await GET();
    const body = await response.json();
    // Security: endpoint should not reveal internal config
    expect(body.data.provider).toBe("pollinations");
    expect(body.data.premiumConfigured).toBe(false);
    expect(body.data.limits.rpm).toBe(0);
    expect(body.data.limits.dailyTokens).toBe(0);
  });
});
