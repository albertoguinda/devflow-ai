import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("cron-builder");

export default function CronBuilderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="cron-builder" />
      {children}
      <ToolSeoContent slug="cron-builder" />
    </>
  );
}
