import type { AIProviderPort } from "@/application/ports/ai-provider.port";
import type { AITextResponse, GenerateOptions } from "@/types/ai";

/**
 * Composite AI provider that tries each underlying provider in order,
 * falling through to the next when one fails (rate limit / quota / timeout /
 * upstream outage). The factory appends Pollinations (no key required) as the
 * last link, so the chain degrades gracefully instead of hard-failing when a
 * single free tier is exhausted.
 */
export class FallbackAIProvider implements AIProviderPort {
  private readonly providers: AIProviderPort[];

  constructor(providers: AIProviderPort[]) {
    this.providers = providers.filter((p) => p.isAvailable());
  }

  isAvailable(): boolean {
    return this.providers.length > 0;
  }

  async generateText(
    prompt: string,
    systemPrompt: string,
    options?: GenerateOptions,
  ): Promise<AITextResponse> {
    let lastError: unknown;

    for (const provider of this.providers) {
      try {
        return await provider.generateText(prompt, systemPrompt, options);
      } catch (error) {
        lastError = error;
        console.warn(
          "[ai-fallback] provider failed, trying next:",
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("All AI providers failed");
  }
}
