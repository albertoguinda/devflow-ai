import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("cost-calculator");

export default function CostCalculatorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="cost-calculator" />
      {children}
      <ToolSeoContent slug="cost-calculator" />
    </>
  );
}
