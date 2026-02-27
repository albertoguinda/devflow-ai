import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | DevFlow AI",
  description:
    "Learn about DevFlow AI — a free, open-source developer toolkit with 15 local-first tools and optional AI enhancements.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
