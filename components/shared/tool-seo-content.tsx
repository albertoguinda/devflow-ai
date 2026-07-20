import { getToolContent } from "@/config/tool-content";
import { getToolBySlug } from "@/config/tools-data";
import { safeJsonLd } from "@/lib/metadata";

const SITE_URL = "https://devflowai.dev";

/**
 * Server-rendered SEO/GEO content for a tool page: intro, how-to steps, and FAQ.
 * The text is crawlable regardless of the client widget, and emits HowTo +
 * FAQPage JSON-LD. Renders nothing when the tool has no authored content.
 */
export function ToolSeoContent({ slug }: { slug: string }) {
  const content = getToolContent(slug);
  const tool = getToolBySlug(slug);
  if (!content || !tool) return null;

  const toolUrl = `${SITE_URL}/tools/${tool.slug}`;

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to use ${tool.name}`,
    description: content.intro,
    url: toolUrl,
    step: content.howTo.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
    tool: { "@type": "HowToTool", name: "Any modern web browser" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const aboutId = `about-${tool.slug}`;
  const howToId = `howto-${tool.slug}`;
  const faqId = `faq-${tool.slug}`;

  return (
    <section
      aria-label={`About ${tool.name}`}
      className="mx-auto mt-10 max-w-4xl space-y-10"
    >
      <div className="space-y-3">
        <h2 id={aboutId} className="text-xl font-semibold text-foreground">
          About {tool.name}
        </h2>
        <p className="leading-relaxed text-muted-foreground">{content.intro}</p>
      </div>

      <div className="space-y-3">
        <h2 id={howToId} className="text-xl font-semibold text-foreground">
          How to use {tool.name}
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-muted-foreground marker:text-muted-foreground">
          {content.howTo.map((step) => (
            <li key={step.name}>
              <span className="font-medium text-foreground">{step.name}.</span>{" "}
              {step.text}
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-4">
        <h2 id={faqId} className="text-xl font-semibold text-foreground">
          Frequently asked questions
        </h2>
        <dl className="space-y-4">
          {content.faq.map((item) => (
            <div key={item.q} className="space-y-1">
              <dt className="font-medium text-foreground">{item.q}</dt>
              <dd className="leading-relaxed text-muted-foreground">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
      />
    </section>
  );
}
