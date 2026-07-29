import type { MetadataRoute } from "next";
import { TOOLS_DATA } from "@/config/tools-data";

const SITE_URL = "https://devflowai.dev";

/*
 * No `alternates.languages` here on purpose.
 *
 * The UI is translated into 8 languages, but the translation happens in the
 * client (zustand + locales/*.json): every language is served from the SAME
 * URL and the HTML that crawlers get is always English. This file used to
 * declare 8 hreflang entries all pointing at that single URL, which is an
 * invalid hreflang cluster — Google drops it, and it advertised 7 language
 * versions that do not exist as indexable pages.
 *
 * Re-add hreflang only alongside real per-locale routes (`/es/tools/<slug>`)
 * with server-rendered translated content.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/docs`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const toolPages: MetadataRoute.Sitemap = TOOLS_DATA.map((tool) => ({
    url: `${SITE_URL}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...toolPages];
}
