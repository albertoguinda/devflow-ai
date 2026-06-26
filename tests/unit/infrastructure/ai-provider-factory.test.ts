import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock env module
const mockGetServerEnv = vi.fn();
vi.mock("@/infrastructure/config/env", () => ({
  getServerEnv: () => mockGetServerEnv(),
}));

// Mock all provider constructors
vi.mock("@/infrastructure/external/gemini-client", () => ({
  GeminiClient: class MockGeminiClient {
    _provider = "gemini" as const;
    constructor(public apiKey: string) {}
    isAvailable() { return true; }
  },
}));

vi.mock("@/infrastructure/external/groq-client", () => ({
  GroqClient: class MockGroqClient {
    _provider = "groq" as const;
    constructor(public apiKey: string) {}
    isAvailable() { return true; }
  },
}));

vi.mock("@/infrastructure/external/openrouter-client", () => ({
  OpenRouterClient: class MockOpenRouterClient {
    _provider = "openrouter" as const;
    constructor(public apiKey: string) {}
    isAvailable() { return true; }
  },
}));

vi.mock("@/infrastructure/external/pollinations-client", () => ({
  PollinationsClient: class MockPollinationsClient {
    _provider = "pollinations" as const;
    isAvailable() { return true; }
  },
}));

// Capture the ordered provider chain handed to the fallback wrapper.
vi.mock("@/infrastructure/external/fallback-ai-provider", () => ({
  FallbackAIProvider: class MockFallbackAIProvider {
    constructor(public providers: Array<{ _provider: string }>) {}
    isAvailable() { return this.providers.length > 0; }
  },
}));

import { createAIProvider } from "@/infrastructure/external/ai-provider-factory";

const defaultEnv = {
  GEMINI_API_KEY: undefined,
  GROQ_API_KEY: undefined,
  OPENROUTER_API_KEY: undefined,
  RATE_LIMIT_RPM: 10,
  RATE_LIMIT_DAILY_TOKENS: 500_000,
};

function chain(provider: unknown): string[] {
  return (provider as { providers: Array<{ _provider: string }> }).providers.map(
    (p) => p._provider,
  );
}

describe("createAIProvider (runtime fallback chain)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerEnv.mockReturnValue({ ...defaultEnv });
  });

  // --- BYOK: user's provider first, Pollinations as safety net ---

  it("BYOK gemini → [gemini, pollinations]", () => {
    expect(chain(createAIProvider({ key: "user-key", provider: "gemini" }))).toEqual([
      "gemini",
      "pollinations",
    ]);
  });

  it("BYOK groq → [groq, pollinations]", () => {
    expect(chain(createAIProvider({ key: "user-key", provider: "groq" }))).toEqual([
      "groq",
      "pollinations",
    ]);
  });

  it("BYOK openrouter → [openrouter, pollinations]", () => {
    expect(
      chain(createAIProvider({ key: "user-key", provider: "openrouter" })),
    ).toEqual(["openrouter", "pollinations"]);
  });

  // --- Env-based chain: in order, Pollinations always last ---

  it("only GEMINI_API_KEY → [gemini, pollinations]", () => {
    mockGetServerEnv.mockReturnValue({ ...defaultEnv, GEMINI_API_KEY: "gm" });
    expect(chain(createAIProvider())).toEqual(["gemini", "pollinations"]);
  });

  it("only GROQ_API_KEY → [groq, pollinations]", () => {
    mockGetServerEnv.mockReturnValue({ ...defaultEnv, GROQ_API_KEY: "gq" });
    expect(chain(createAIProvider())).toEqual(["groq", "pollinations"]);
  });

  it("all keys → [gemini, groq, openrouter, pollinations]", () => {
    mockGetServerEnv.mockReturnValue({
      ...defaultEnv,
      GEMINI_API_KEY: "gm",
      GROQ_API_KEY: "gq",
      OPENROUTER_API_KEY: "or",
    });
    expect(chain(createAIProvider())).toEqual([
      "gemini",
      "groq",
      "openrouter",
      "pollinations",
    ]);
  });

  it("no keys → [pollinations] (still works, no hard fail)", () => {
    expect(chain(createAIProvider())).toEqual(["pollinations"]);
  });

  it("BYOK takes priority over env vars", () => {
    mockGetServerEnv.mockReturnValue({ ...defaultEnv, GEMINI_API_KEY: "gm" });
    expect(chain(createAIProvider({ key: "user-key", provider: "groq" }))).toEqual([
      "groq",
      "pollinations",
    ]);
  });

  it("never returns null (Pollinations always present)", () => {
    expect(createAIProvider()).not.toBeNull();
  });
});
