import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("git-commit-generator");

export default function GitCommitGeneratorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="git-commit-generator" />
      {children}
      <ToolSeoContent slug="git-commit-generator" />
    </>
  );
}
