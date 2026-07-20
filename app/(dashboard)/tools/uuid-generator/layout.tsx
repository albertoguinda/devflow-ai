import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("uuid-generator");

export default function UuidGeneratorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="uuid-generator" />
      {children}
      <ToolSeoContent slug="uuid-generator" />
    </>
  );
}
