import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("code-review");

export default function CodeReviewLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="code-review" />
      {children}
      <ToolSeoContent slug="code-review" />
    </>
  );
}
