import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("diff-comparer");

export default function DiffComparerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="diff-comparer" />
      {children}
      <ToolSeoContent slug="diff-comparer" />
    </>
  );
}
