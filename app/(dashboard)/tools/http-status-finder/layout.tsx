import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("http-status-finder");

export default function HttpStatusFinderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="http-status-finder" />
      {children}
      <ToolSeoContent slug="http-status-finder" />
    </>
  );
}
