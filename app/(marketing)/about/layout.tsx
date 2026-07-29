import type { Metadata } from "next";

const SITE_URL = "https://devflowai.dev";

export const metadata: Metadata = {
  // Bare: the root layout appends " | DevFlowAI". Also "DevFlow AI" with a space
  // is a different brand token from "DevFlowAI" — keep one spelling everywhere.
  title: "About",
  description:
    "Learn about DevFlow AI — a free, open-source developer toolkit with 20 local-first tools and optional AI enhancements. No login, no API keys required.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About DevFlowAI — Free Developer Toolkit",
    description:
      "Learn about DevFlow AI — a free, open-source developer toolkit with 20 local-first tools and optional AI enhancements.",
    url: `${SITE_URL}/about`,
    type: "website",
    siteName: "DevFlowAI",
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "DevFlowAI - 20 Free Developer Tools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About DevFlowAI — Free Developer Toolkit",
    description:
      "Learn about DevFlow AI — a free, open-source developer toolkit with 20 local-first tools and optional AI enhancements.",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
