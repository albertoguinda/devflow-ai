import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("hash-generator");

export default function HashGeneratorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="hash-generator" />
      {children}
      <ToolSeoContent slug="hash-generator" />
    </>
  );
}
