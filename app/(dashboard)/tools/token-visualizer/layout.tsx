import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("token-visualizer");

export default function TokenVisualizerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="token-visualizer" />
      {children}
      <ToolSeoContent slug="token-visualizer" />
    </>
  );
}
