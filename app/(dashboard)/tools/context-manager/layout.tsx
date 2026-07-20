import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("context-manager");

export default function ContextManagerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="context-manager" />
      {children}
      <ToolSeoContent slug="context-manager" />
    </>
  );
}
