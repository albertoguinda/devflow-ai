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
      ...tool.tags,
      "free developer tool",
      "online",
      "no login",
      "open source",
      "AI",
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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
