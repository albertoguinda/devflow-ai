import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("dto-matic");

export default function DtoMaticLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="dto-matic" />
      {children}
      <ToolSeoContent slug="dto-matic" />
    </>
  );
}
