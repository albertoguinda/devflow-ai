import { Navbar } from "@/components/layout/navbar";

const SITE_URL = "https://devflowai.dev";

/** Serialize JSON-LD safely — escapes injection vectors */
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to use DevFlowAI developer tools",
  description:
    "Use 20 free browser-based developer tools for JSON formatting, code review, regex testing, and more — no login required.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Open DevFlowAI",
      text: `Visit ${SITE_URL} in any modern browser. No installation or login needed.`,
      url: SITE_URL,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Choose a tool",
      text: "Browse or search the 20 available tools: JSON Formatter, Regex Humanizer, Base64 Encoder, UUID Generator, Hash Generator, and more.",
      url: `${SITE_URL}/tools`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Paste your input",
      text: "Paste your code, JSON, regex, or text into the input area. All processing happens locally in your browser.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Get instant results",
      text: "View formatted output, analysis results, or generated code. Copy to clipboard with one click. Optionally enable AI enhancements for deeper analysis.",
    },
  ],
  totalTime: "PT1M",
  tool: {
    "@type": "HowToTool",
    name: "Any modern web browser",
  },
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(howToJsonLd) }}
      />
      <Navbar />
      <main id="main-content" className="flex-1">{children}</main>
    </>
  );
}
