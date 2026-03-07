import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";

export const metadata = generateToolMetadata("json-formatter");

export default function JsonFormatterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="json-formatter" />
      {children}
    </>
  );
}
