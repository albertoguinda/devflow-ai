import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/components/shared";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const SITE_URL = "https://devflowai.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DevFlowAI - Free & Open Source Developer Utilities",
    template: "%s | DevFlowAI",
  },
  description:
    "Free, open-source developer toolkit for AI development. Analyze prompts, review code, calculate API costs, visualize tokens, and manage context windows. Built by developers, for developers.",
  keywords: [
    "AI developer tools",
    "free developer tools",
    "open source developer toolkit",
    "prompt engineering tools",
    "AI code review",
    "API cost calculator",
    "token visualizer",
    "context window manager",
    "JSON formatter online",
    "regex tester",
    "cron builder",
    "base64 encoder decoder",
    "UUID generator",
    "TypeScript DTO generator",
    "Tailwind CSS sorter",
    "git commit generator",
    "HTTP status codes",
    "variable name generator",
    "LLM tools",
    "ChatGPT tools",
    "Claude tools",
    "GPT token counter",
    "no login developer tools",
    "herramientas para desarrolladores",
    "herramientas IA gratis",
  ],
  authors: [{ name: "DevFlowAI Community" }],
  creator: "DevFlowAI",
  publisher: "DevFlowAI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "es_ES",
    url: SITE_URL,
    siteName: "DevFlowAI",
    title: "DevFlowAI - Free & Open Source Developer Utilities",
    description:
      "Free, open-source developer toolkit for AI development. 15 browser-based tools — prompt analyzer, code review, API cost calculator, token visualizer, and more. No login required.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevFlowAI - Free & Open Source Developer Utilities",
    description:
      "Free, open-source developer toolkit for AI development. Built by developers, for developers.",
    creator: "@devflowai",
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "Developer Tools",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

/** Serialize JSON-LD safely — escapes </script> injection vectors */
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "DevFlowAI",
  url: SITE_URL,
  description:
    "Free & open-source developer toolkit for AI development. Analyze prompts, review code, calculate API costs, and more.",
  inLanguage: ["en", "es"],
  creator: {
    "@type": "Organization",
    name: "DevFlowAI Community",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/tools?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DevFlowAI",
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  description:
    "Open-source developer tools community building free, privacy-first utilities for AI development.",
  sameAs: [
    "https://github.com/albertoguinda/devflow-ai",
  ],
  foundingDate: "2025",
  knowsLanguage: ["en", "es"],
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DevFlowAI",
  url: SITE_URL,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: "Prompt Analyzer, Code Review, API Cost Calculator, Token Visualizer, Context Manager, JSON Formatter, Regex Humanizer, DTO-Matic, Cron Builder, Tailwind Sorter, Variable Name Wizard, HTTP Status Finder, Git Commit Generator, Base64 Encoder, UUID Generator",
  softwareVersion: "4.15.2",
  numberOfDownloads: "10000+",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "15",
    bestRating: "5",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="philosophy" content="Para vosotros, developers" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable site description" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="LLM-readable full documentation" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(softwareJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-background text-foreground antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          <ErrorBoundary>{children}</ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
