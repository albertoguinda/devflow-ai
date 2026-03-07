import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";

export const metadata = generateToolMetadata("prompt-analyzer");

export default function PromptAnalyzerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="prompt-analyzer" />
      {children}
    </>
  );
}
