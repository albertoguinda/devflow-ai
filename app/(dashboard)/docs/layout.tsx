import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation | DevFlow AI",
  description:
    "DevFlow AI documentation — setup guides, tool reference, and API documentation for all 15 developer utilities.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
