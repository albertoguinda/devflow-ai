import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";

export const metadata = generateToolMetadata("variable-name-wizard");

export default function VariableNameWizardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="variable-name-wizard" />
      {children}
    </>
  );
}
