import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("prompt-analyzer");

export default function PromptAnalyzerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="prompt-analyzer" />
      {children}
      <ToolSeoContent slug="prompt-analyzer" />
    </>
  );
}
