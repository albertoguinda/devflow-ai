import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools-data";

const SITE_URL = "https://devflowai.dev";

export function generateToolMetadata(slug: string): Metadata {
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: "Tool Not Found",
    };
  }

  const title = `${tool.name} — Free Online Developer Tool | DevFlowAI`;
  const description = tool.longDescription;

  return {
    title: tool.name,
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
      `${tool.name} herramienta gratis`,
      `${tool.name} outil gratuit`,
      `${tool.name} ferramenta gratis`,
    ],
    alternates: {
      canonical: `${SITE_URL}/tools/${tool.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/tools/${tool.slug}`,
      type: "website",
      siteName: "DevFlowAI",
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${tool.name} — Free Online Developer Tool | DevFlowAI`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/opengraph-image`],
    },
  };
}

/** Serialize JSON-LD safely — escapes injection vectors */
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

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
    browserRequirements: "Requires a modern web browser (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+)",
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
