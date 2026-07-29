import type { Metadata } from "next";

const SITE_URL = "https://devflowai.dev";

export const metadata: Metadata = {
  // `absolute`: a plain string here would replace the whole title object for
  // this subtree and strip the root `%s | DevFlowAI` template from the 20 tool
  // pages underneath. Each tool sets its own absolute title for the same reason.
  title: {
    absolute: "Free Developer Tools — 20 Browser Tools, No Login | DevFlowAI",
  },
  description:
    "Browse all 20 free developer tools: JSON formatter, Base64 encoder, UUID generator, regex tester, git commit generator, hash generator, JWT decoder, color converter, diff comparer, password generator, and more.",
  alternates: {
    canonical: `${SITE_URL}/tools`,
  },
};

export default function ToolsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The ItemList JSON-LD used to live here, which meant every one of the 20 tool
  // pages also advertised the full 20-item catalogue as its own entity. It now
  // renders only on the hub, from tools/page.tsx.
  return children;
}
