import type { MetadataRoute } from "next";

/** Traditional search crawlers. */
const SEARCH_ENGINES = [
  "Googlebot",
  "Bingbot",
  "Applebot",
  "YandexBot",
  "Baiduspider",
];

/**
 * AI crawlers, allowed on purpose.
 *
 * Two kinds, and both are worth allowing here. Retrieval/grounding agents
 * (`OAI-SearchBot`, `PerplexityBot`, `Google-Extended`, `Claude-SearchBot`…)
 * are what make a citation possible at all — blocking them removes the site
 * from AI answers. Training crawlers (`GPTBot`, `ClaudeBot`, `CCBot`) are pure
 * upside for an MIT-licensed free toolkit with nothing to monetise: brand
 * recall without needing retrieval. There is no cannibalisation risk because
 * the conversion here is "use the tool", not "read the article".
 */
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "Google-Extended",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot-Extended",
  "MistralAI-User",
  "Amazonbot",
  "CCBot",
  "Meta-ExternalAgent",
  "FacebookExternalHit",
  "Bytespider",
  "cohere-ai",
  "YouBot",
  "Diffbot",
  "ImagesiftBot",
];

/**
 * `/api/` is off limits for everyone.
 *
 * It has to be repeated in every group, not just in `*`: robots.txt groups are
 * not inherited. A crawler obeys the most specific group that names it and
 * ignores the rest, so a `Googlebot` group with only `Allow: /` would have let
 * Googlebot crawl `/api/health` and `/api/ai/status` — which answer GET 200 —
 * no matter what the wildcard group said.
 */
const DISALLOW = "/api/";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...SEARCH_ENGINES.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: "https://devflowai.dev/sitemap.xml",
    host: "https://devflowai.dev",
  };
}
