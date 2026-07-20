import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("jwt-decoder");

export default function JwtDecoderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="jwt-decoder" />
      {children}
      <ToolSeoContent slug="jwt-decoder" />
    </>
  );
}
