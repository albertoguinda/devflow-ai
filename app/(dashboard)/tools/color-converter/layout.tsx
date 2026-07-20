import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("color-converter");

export default function ColorConverterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="color-converter" />
      {children}
      <ToolSeoContent slug="color-converter" />
    </>
  );
}
