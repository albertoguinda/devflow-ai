import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("variable-name-wizard");

export default function VariableNameWizardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="variable-name-wizard" />
      {children}
      <ToolSeoContent slug="variable-name-wizard" />
    </>
  );
}
