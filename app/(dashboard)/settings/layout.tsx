import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Configure your DevFlowAI preferences. Manage theme, notifications, and tool settings.",
  robots: { index: false, follow: true },
};

export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
