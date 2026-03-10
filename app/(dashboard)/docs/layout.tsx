import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation | DevFlow AI",
  description:
    "DevFlow AI documentation — setup guides, tool reference, and API documentation for all 20 developer utilities.",
  alternates: {
    canonical: "https://devflowai.dev/docs",
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
