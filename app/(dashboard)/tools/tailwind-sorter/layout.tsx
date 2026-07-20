import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("tailwind-sorter");

export default function TailwindSorterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="tailwind-sorter" />
      {children}
      <ToolSeoContent slug="tailwind-sorter" />
    </>
  );
}
