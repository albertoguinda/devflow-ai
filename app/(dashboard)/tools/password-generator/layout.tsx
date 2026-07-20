import { generateToolMetadata, ToolJsonLd } from "@/lib/metadata";
import { ToolSeoContent } from "@/components/shared";

export const metadata = generateToolMetadata("password-generator");

export default function PasswordGeneratorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ToolJsonLd slug="password-generator" />
      {children}
      <ToolSeoContent slug="password-generator" />
    </>
  );
}
