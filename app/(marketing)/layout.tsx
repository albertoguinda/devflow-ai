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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is DevFlowAI free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, DevFlowAI is 100% free and open source. All 20 tools work without login, API keys, or credit card. AI features use free providers by default.",
      },
    },
    {
      "@type": "Question",
      name: "Does DevFlowAI require an API key?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. All tools work locally in your browser without any API key. AI-enhanced features are optional and use free providers (Pollinations). You can optionally bring your own key (BYOK) for Gemini, Groq, or OpenRouter.",
      },
    },
    {
      "@type": "Question",
      name: "What tools are included in DevFlowAI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DevFlowAI includes 20 tools: Prompt Analyzer, Code Review Assistant, API Cost Calculator, Token Visualizer, Context Manager, JSON Formatter, Regex Humanizer, DTO-Matic, Cron Builder, Tailwind Sorter, Variable Name Wizard, HTTP Status Finder, Git Commit Generator, Base64 Encoder/Decoder, UUID Generator, Hash Generator, JWT Decoder, Color Converter, Diff Comparer, and Password Generator.",
      },
    },
    {
      "@type": "Question",
      name: "Is my data safe with DevFlowAI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. DevFlowAI is local-first — all processing happens in your browser. Data is stored in localStorage and never sent to any server unless you explicitly use an AI feature. No tracking, no analytics cookies.",
      },
    },
  ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
      />
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </>
  );
}
