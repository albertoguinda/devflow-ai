import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "History",
  description:
    "View your DevFlowAI usage history. Revisit previous tool results and analyses.",
  robots: { index: false, follow: true },
};

export default function HistoryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
