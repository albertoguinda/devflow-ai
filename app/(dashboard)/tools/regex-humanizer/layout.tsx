import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("regex-humanizer");

export default function RegexHumanizerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="regex-humanizer" />
      {children}
      <ToolSeoContent slug="regex-humanizer" />
    </>
  );
}
