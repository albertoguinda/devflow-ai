import type { Metadata } from "next";
import { TOOLS_DATA } from "@/config/tools-data";

const SITE_URL = "https://devflowai.dev";

export const metadata: Metadata = {
  title: "Developer Tools",
  description:
    "Browse all 20 free developer tools: JSON formatter, Base64 encoder, UUID generator, regex tester, git commit generator, hash generator, JWT decoder, color converter, diff comparer, password generator, and more.",
  alternates: {
    canonical: `${SITE_URL}/tools`,
  },
};

/** Serialize JSON-LD safely — escapes injection vectors */
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "DevFlowAI Developer Tools",
  description: "Free, open-source browser-based developer tools",
  numberOfItems: TOOLS_DATA.length,
  itemListElement: TOOLS_DATA.map((tool, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: tool.name,
    url: `${SITE_URL}/tools/${tool.slug}`,
  })),
};

export default function ToolsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListJsonLd) }}
      />
      {children}
    </>
  );
}
