import type { MetadataRoute } from "next";
import { TOOLS_DATA } from "@/config/tools-data";

const SITE_URL = "https://devflowai.dev";

/** All supported languages — client-side i18n serves all from same URL */
const LANGUAGES = ["en", "es", "fr", "pt", "de", "it", "zh", "ja"] as const;

/** Build language alternates for a given path (same URL = client-side multilingual) */
function langAlternates(path: string): Record<string, string> {
  const url = path ? `${SITE_URL}${path}` : SITE_URL;
  const alts: Record<string, string> = { "x-default": url };
  for (const lang of LANGUAGES) {
    alts[lang] = url;
  }
  return alts;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: { languages: langAlternates("") },
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: { languages: langAlternates("/tools") },
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: { languages: langAlternates("/about") },
    },
    {
      url: `${SITE_URL}/docs`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: { languages: langAlternates("/docs") },
    },
  ];

  const toolPages: MetadataRoute.Sitemap = TOOLS_DATA.map((tool) => ({
    url: `${SITE_URL}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.9,
    alternates: { languages: langAlternates(`/tools/${tool.slug}`) },
  }));

  return [...staticPages, ...toolPages];
}
