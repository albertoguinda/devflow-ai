import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools-data";
import { safeJsonLd } from "@/lib/json-ld";

const SITE_URL = "https://devflowai.dev";

/**
 * Search titles, keyword-first.
 *
 * `tool.name` is the product name, and five of them ("DTO-Matic", "Regex
 * Humanizer", "Token Visualizer", "Variable Name Wizard", "Context Manager")
 * are invented words that match no search query at all. These titles lead with
 * what people actually type and keep the brand in the root layout's
 * `%s | DevFlowAI` template — do NOT repeat "DevFlowAI" here or it renders twice.
 */
const TOOL_TITLES: Record<string, string> = {
  "prompt-analyzer": "Prompt Injection Checker & Prompt Analyzer",
  "code-review": "AI Code Review Online — Free, No Signup",
  "cost-calculator": "LLM API Cost Calculator — GPT, Claude, Gemini",
  "token-visualizer": "LLM Token Counter & Tokenizer Visualizer",
  "context-manager": "LLM Context Window Manager & Optimizer",
  "regex-humanizer": "Regex Explainer — Regex in Plain English",
  "dto-matic": "JSON to TypeScript, Zod & Mappers",
  "cron-builder": "Cron Expression Generator & Explainer",
  "tailwind-sorter": "Tailwind Class Sorter — Sort & Dedupe",
  "variable-name-wizard": "Variable Name Generator & Case Converter",
  "json-formatter": "JSON Formatter & Validator — In-Browser",
  base64: "Base64 Encoder & Decoder — Data URLs",
  "uuid-generator": "UUID Generator — v1, v4 and v7 Online",
  "git-commit-generator": "Conventional Commit Message Generator",
  "http-status-finder": "HTTP Status Code Finder — Every Code",
  "hash-generator": "SHA-256, MD5 & HMAC Hash Generator",
  "jwt-decoder": "JWT Decoder Online — 100% In-Browser",
  "color-converter": "Color Converter — HEX, RGB, HSL, OKLCH",
  "diff-comparer": "Text & JSON Diff Checker Online",
  "password-generator": "Password Generator — Entropy & Strength",
};

/** Optimized meta descriptions (150-160 chars, includes CTA, keyword-rich) */
const TOOL_DESCRIPTIONS: Record<string, string> = {
  "prompt-analyzer": "Analyze AI prompts for quality, clarity, and security. Detect prompt injection risks. Get improvement suggestions. Try free — no login.",
  "code-review": "Review code for bugs, anti-patterns, and refactoring opportunities. Supports TypeScript, JavaScript, Python. Get instant feedback.",
  "cost-calculator": "Compare AI API costs across OpenAI, Anthropic, Google. Estimate monthly spending. Find the cheapest model for your needs.",
  "token-visualizer": "See how AI models tokenize your text in real time. Count tokens, estimate costs. Optimize prompts for context limits.",
  "context-manager": "Organize and optimize LLM context windows. Drag-drop files, prioritize relevance. Preview context before API calls.",
  "regex-humanizer": "Explain regex patterns in plain English or generate from text descriptions. Test patterns with syntax highlighting.",
  "dto-matic": "Convert JSON to TypeScript interfaces, entities, and mappers. Generate Zod schemas. Follow Clean Architecture patterns.",
  "cron-builder": "Build cron expressions visually without memorizing syntax. See human-readable explanations and next execution times.",
  "tailwind-sorter": "Sort Tailwind CSS classes by category. Remove duplicates, organize variants. Keep CSS clean and consistent.",
  "variable-name-wizard": "Generate perfect variable names from descriptions. Convert between naming conventions. Get language-specific suggestions.",
  "json-formatter": "Format, minify, validate JSON. Extract paths, compare documents, generate TypeScript. Real-time statistics.",
  "base64": "Encode and decode Base64 instantly. URL-safe variants, data URLs, Unicode support. See size metrics and comparisons.",
  "uuid-generator": "Generate and validate UUIDs in all versions (v1, v4, v7). Bulk generation, multiple formats, parse metadata.",
  "git-commit-generator": "Create conventional commit messages with emojis. Smart scope suggestions, breaking changes, validation.",
  "http-status-finder": "Search and learn HTTP status codes. 55+ codes with descriptions, examples, and when to use them.",
  "hash-generator": "Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes. HMAC support, constant-time comparison, auto-detect.",
  "jwt-decoder": "Decode JWT tokens instantly. See header, payload, signature. Check expiration, validate algorithms.",
  "color-converter": "Convert colors between HEX, RGB, HSL, OKLCH, HWB. WCAG contrast checker. Generate color palettes.",
  "diff-comparer": "Compare two texts side by side. See added, removed, and unchanged lines. Color-coded diff output.",
  "password-generator": "Create truly random passwords using crypto.getRandomValues(). Strength meter, entropy calculation.",
};

export function generateToolMetadata(slug: string): Metadata {
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: "Tool Not Found",
    };
  }

  // Bare title: the root layout applies the `%s | DevFlowAI` template.
  const title = TOOL_TITLES[slug] ?? `${tool.name} — Free Online Developer Tool`;
  // Social cards are not templated, so they carry the brand explicitly.
  const socialTitle = `${title} | DevFlowAI`;
  const description = TOOL_DESCRIPTIONS[slug] || tool.longDescription.slice(0, 160);

  return {
    // `absolute` because the `%s | DevFlowAI` template from the root layout does
    // not reach here: app/(dashboard)/tools/layout.tsx sets a plain-string title,
    // which replaces the whole title object (template included) for its subtree.
    // Live check before this fix: `<title>JSON Formatter</title>`, no brand.
    title: { absolute: socialTitle },
    description,
    keywords: [
      tool.name,
      `${tool.name} online`,
      `${tool.name} free`,
      ...tool.tags,
      "free developer tool",
      "online",
      "no login",
      "open source",
      "AI",
      "browser-based",
      "developer utility",
    ],
    alternates: {
      canonical: `${SITE_URL}/tools/${tool.slug}`,
    },
    openGraph: {
      title: socialTitle,
      description,
      url: `${SITE_URL}/tools/${tool.slug}`,
      type: "website",
      siteName: "DevFlowAI",
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: socialTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [`${SITE_URL}/opengraph-image`],
    },
  };
}

// Re-exported so existing imports keep working; the implementation lives in
// lib/json-ld.ts, which client components can import without pulling in the
// per-tool title and description tables above.
export { safeJsonLd };

/**
 * Per-tool structured data: WebApplication + BreadcrumbList JSON-LD.
 * Render inside each tool's server layout for Google rich results.
 */
export function ToolJsonLd({ slug }: { slug: string }) {
  const tool = getToolBySlug(slug);
  if (!tool) return null;

  const toolUrl = `${SITE_URL}/tools/${tool.slug}`;

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    browserRequirements:
      "Requires a modern web browser (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+)",
    softwareVersion: "4.21.0",
    inLanguage: ["en", "es", "fr", "pt", "de", "it", "zh", "ja"],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    description: tool.longDescription,
    featureList: tool.features.join(", "),
    screenshot: `${SITE_URL}/opengraph-image`,
    author: {
      "@type": "Organization",
      name: "DevFlowAI Community",
      url: SITE_URL,
    },
    isPartOf: {
      "@type": "WebSite",
      name: "DevFlowAI",
      url: SITE_URL,
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: `${SITE_URL}/tools`,
      },
      { "@type": "ListItem", position: 3, name: tool.name, item: toolUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(webApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumb) }}
      />
    </>
  );
}
