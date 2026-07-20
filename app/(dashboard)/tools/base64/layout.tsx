import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("base64");

export default function Base64Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="base64" />
      {children}
      <ToolSeoContent slug="base64" />
    </>
  );
}
