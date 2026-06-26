import type { AIProviderPort } from "@/application/ports/ai-provider.port";
import type { AIProviderType, BYOKConfig } from "@/types/ai";
import { getServerEnv } from "@/infrastructure/config/env";
import { GeminiClient } from "./gemini-client";
import { GroqClient } from "./groq-client";
import { OpenRouterClient } from "./openrouter-client";
import { PollinationsClient } from "./pollinations-client";
import { FallbackAIProvider } from "./fallback-ai-provider";

/**
 * Creates an AI provider with a runtime fallback chain. Each provider is tried
 * in order and, if it fails (rate limit / quota / timeout / outage), the next
 * one is attempted. Pollinations (no key needed) is always the last link, so a
 * single exhausted free tier never takes the AI down.
 *
 * Order:
 * 1. BYOK key (user's own key) → their provider, then Pollinations
 * 2. GEMINI_API_KEY → Gemini 2.0 Flash
 * 3. GROQ_API_KEY → Groq Llama 3.1 70B
 * 4. OPENROUTER_API_KEY → OpenRouter free models
 * 5. Pollinations → always available, no key needed
 */
export function createAIProvider(byok?: BYOKConfig): AIProviderPort | null {
  // 1. BYOK — user's own key, with Pollinations as a safety net.
  if (byok?.key) {
    return new FallbackAIProvider([
      createProviderByType(byok.provider, byok.key),
      new PollinationsClient(),
    ]);
  }

  // 2. Server-configured providers, tried in order, falling through on error.
  //    Pollinations (no key) is always appended last so the chain never
  //    hard-fails when a free tier is rate-limited or out of quota.
  const env = getServerEnv();
  const chain: AIProviderPort[] = [];

  if (env.GEMINI_API_KEY) chain.push(new GeminiClient(env.GEMINI_API_KEY));
  if (env.GROQ_API_KEY) chain.push(new GroqClient(env.GROQ_API_KEY));
  if (env.OPENROUTER_API_KEY) chain.push(new OpenRouterClient(env.OPENROUTER_API_KEY));
  chain.push(new PollinationsClient());

  return new FallbackAIProvider(chain);
}

function createProviderByType(
  provider: AIProviderType,
  key: string,
): AIProviderPort {
  switch (provider) {
    case "gemini":
      return new GeminiClient(key);
    case "groq":
      return new GroqClient(key);
    case "openrouter":
      return new OpenRouterClient(key);
    case "pollinations":
      return new PollinationsClient();
  }
}
