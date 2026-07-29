# SEO / GEO roadmap

> Audit date: 2026-07-29 · Against v4.21.0 · Verified against the code **and** the
> live site (`curl https://devflowai.dev/...`), not assumed.

This file is the durable output of a full SEO + GEO + positioning audit. The cheap,
verifiable fixes were applied the same day (see "Already done"). Everything under
"Pending" is real work that was scoped but deliberately not started — read this
before opening a new SEO session so you do not re-derive the same findings.

---

## Already done (2026-07-29)

| Fix | Where | Why it mattered |
| --- | --- | --- |
| `data-exclude-hash="true"` on the Umami script | `app/layout.tsx` | Share links carry the whole tool state (JSON, JWTs, source code) in the URL fragment. Umami was shipping that fragment as part of the page URL — a genuine data leak, plus thousands of junk URLs in the report. |
| Privacy copy corrected | `app/(marketing)/layout.tsx`, `public/llms-full.txt` | The FAQ JSON-LD claimed "No tracking, no analytics cookies" while Umami was loading. A false claim in structured data is worse than no claim, and on Hacker News it gets found in the first hour. |
| Keyword-first `title` on the 20 tools, `absolute` | `lib/metadata.tsx` | Live evidence was `<title>JSON Formatter</title>` — 9-22 chars, no brand. `app/(dashboard)/tools/layout.tsx` set a plain-string title, which replaces the whole title object (template included) for its subtree, so the root `%s | DevFlowAI` template never reached the tool pages. Five tools also had invented names nobody searches ("DTO-Matic", "Regex Humanizer", "Token Visualizer", "Variable Name Wizard", "Context Manager"). |
| Meta descriptions capped at 150-160 with a CTA | `lib/metadata.tsx` | `tool.longDescription` ran 236-508 chars; Google truncates around 155-160, so all 20 were cut mid-sentence. |
| Category filter derived from the registry | `app/(dashboard)/tools/page.tsx` | The hand-written list had gone stale and omitted `generation` (7 tools) and `formatting` (3): **half the catalogue was unreachable through the filter.** |
| Dead `[toolId]` route deleted | `app/(dashboard)/tools/[toolId]/` | It was a client component calling `notFound()` in the body, so `/tools/<bogus-slug>` answered **HTTP 200** with two contradictory `<meta name="robots">` tags. Infinite surface of 200-status URLs. The 20 real slugs all have static routes, so the dynamic route only ever ran for invalid ones. |
| `/dashboard` → 308 redirect | `next.config.ts`, deleted `app/(dashboard)/dashboard/` | `redirect("/tools")` inside a pre-rendered page becomes a 200 with a meta-refresh: a 55 KB indexable duplicate of `/tools` carrying its own canonical. |
| Invalid hreflang removed | `app/sitemap.ts` | Every URL declared 9 alternates (`x-default` + 8 languages) all pointing at the *same* URL. A hreflang cluster needs distinct URLs; Google drops the whole cluster. It also advertised 7 language versions that do not exist as indexable pages. |
| `ItemList` moved to the hub | `app/(dashboard)/tools/layout.tsx` → `page.tsx` | The layout is the parent of all 20 tool pages, so each one also advertised the full 20-item catalogue as its own entity. |
| `Disallow: /api/` + 5 retrieval agents | `app/robots.ts` | `/api/health` and `/api/ai/status` answered GET 200 and were crawlable. Added `Claude-User`, `Claude-SearchBot`, `Perplexity-User`, `Applebot-Extended`, `MistralAI-User`. |
| `/about` linked from the navbar | `components/layout/navbar.tsx`, 8 locales | It was in the sitemap with **zero** inbound links from anywhere in the app. |
| Double brand in titles | `app/(marketing)/about/layout.tsx`, `app/(dashboard)/docs/layout.tsx` | Rendered as "About | DevFlow AI | DevFlowAI". Note "DevFlow AI" with a space is a different brand token from "DevFlowAI" — keep one spelling. |
| `llms.txt` refreshed | `public/llms.txt` | Was stamped 2026-03-10. Added a disambiguation block, honest positioning against it-tools / DevToys / CyberChef, and 10 short question-answer pairs an LLM can lift verbatim. |
| 28-29 duplicate keys per locale removed | `locales/*.json` | Shadowed duplicate lines; the earlier value was silently dead. Verified: 0 values changed, 0 keys lost. |

Verification after all of the above: 0 TypeScript errors, 0 ESLint problems,
2014/2014 tests, 0 npm vulnerabilities, production build green.

---

## Pending — ordered by return, not by section

### 1. Off-site seeding (highest return, no code)

This is the real bottleneck and no amount of on-page work substitutes for it.
The on-site GEO layer is already good; what is missing is a corpus for the models
to cite. The roundups that actually feed "best free dev tools 2026" answers are
`dev.to` posts, `alternativeto.net/software/it-tools` and
`aiindigo.com/tools/alternatives/it-tools`. DevFlowAI appears in none of them,
while smaller projects do. The GitHub repo has 1 star and 1 fork.

Order: (a) AlternativeTo listing as an alternative to it-tools and CyberChef,
(b) Product Hunt, (c) Show HN — **one shot only**, (d) PRs to `awesome-devtools`
and `awesome-selfhosted`, (e) 2-3 dev.to posts using the roundup keyword,
(f) r/webdev Showoff Saturday.

Show HN prerequisites, non-negotiable: analytics fixed (done), privacy copy
corrected (done), a title with the real angle ("no login, no tracking, offline,
MIT" — not "I built a toolkit"), and being present in the comments for 6 hours.

### 2. Comparison pages `/vs/*` and `/alternatives`

The best-supported finding of the whole audit: the pages LLMs cite for this
category are literally "IT Tools Alternatives" pages. Build `/vs/it-tools`,
`/vs/devtoys`, `/vs/cyberchef` and an `/alternatives` hub. Each one needs a
comparison table (tool count, offline, login, privacy, AI, languages, license),
an honest "when to pick each" paragraph, and `FAQPage` JSON-LD.

Be honest about the tool count (20 vs ~86 for it-tools vs 300+ for CyberChef).
Skewed comparisons get detected and discarded.

### 3. Internal linking between tools

`components/shared/tool-suggestions.tsx` renders `<Button onPress>`, not
`<a href>`, and returns `null` when there is no input. Grepping the served HTML
of `/tools/json-formatter` finds **zero** links to any other `/tools/<slug>`.
Every tool page is a leaf with no lateral authority flow.

Fix: add a `related: string[]` field to `config/tools-data.ts` and render a
server-side "Related tools" block from each tool's `layout.tsx` (they are already
server components) with 3-5 real `<Link>`s and the tool name as anchor text.
Keep `ToolSuggestions` as-is for contextual UX.

### 4. Category hubs (5 pages)

Current categories are internal mechanics (`generation`, `formatting`), not search
intent, and they are unbalanced (7/5/3/2/1/1/1). Nobody searches "formatting tools".
Proposed regrouping:

| Silo | Hub | Tools |
| --- | --- | --- |
| AI & LLM | `/tools/ai-llm/` | prompt-analyzer, token-visualizer, cost-calculator, context-manager, code-review |
| JSON, data & types | `/tools/json-data/` | json-formatter, dto-matic, base64, diff-comparer |
| Security, crypto & IDs | `/tools/security/` | hash-generator, password-generator, jwt-decoder, uuid-generator |
| Frontend & code | `/tools/frontend/` | tailwind-sorter, color-converter, variable-name-wizard, regex-humanizer |
| Backend & DevOps | `/tools/devops/` | cron-builder, git-commit-generator, http-status-finder |

**Do not** migrate to `/tools/<category>/<slug>`. The slugs already carry the
keyword, several tools belong to more than one cluster, the hierarchy is already
communicated by `BreadcrumbList` JSON-LD, and migrating costs 20 redirects plus
rewrites across `lib/metadata.tsx`, `app/sitemap.ts`, 20 tool layouts, the
speculation rules in `app/(dashboard)/layout.tsx`, the `ToolRoute` union in
`hooks/use-smart-navigation.ts`, 20 E2E specs and `public/llms.txt`.
Hubs are additive: **zero redirects needed.**

Each hub needs 600-800 unique words (not copied from the leaves) plus
`CollectionPage` + `ItemList` + `BreadcrumbList` + `FAQPage`. Guard against a
future tool slug colliding with a hub slug with a build-time assertion.

`/tools` itself also needs 700-900 words of its own to work as the pillar for
"best free online developer tools".

### 5. Extended per-tool content

`config/tool-content.ts` gives ~300 words per tool (intro + howTo + faq). Target
550-750 by adding three sections to the `ToolContent` interface:

- **When to use it** — 4 scenario bullets
- **Real example** — input → output plus a short narration
- **Common mistakes** — 4 problem→fix pairs

"Common mistakes" is the biggest differentiator against it-tools, which never
explains why anything fails, and it is what captures the long tail
("cron every 7 days not working", "why didn't my cron job run").

Also: the `<h2>` headings in `components/shared/tool-seo-content.tsx` are
hardcoded English, which breaks the repo's own i18n rule. Move them to
`locales/*.json` (`seo.section.about`, `seo.section.whenToUse`, …).

### 6. `/guides` and the editorial calendar

There is no `/blog` or `/guides`, so 8 keyword rows have nowhere to land. Realistic
throughput for one person: 2 posts/month for the first two months, 3/month after —
16 posts in 6 months, not 26.

First six, in order: LLM API pricing comparison, cron cheat sheet, why token counts
never match the invoice, Conventional Commits reference, prompt injection examples,
JSON to TypeScript.

**Do not** write: "JSON formatter online", "what is JSON", "decode JWT online",
"base64 decode", "MD5 generator" — those SERPs return *tools*, not articles, so an
article both fails to rank and cannibalises your own tool page. Skip textbook
definitions ("what is HTTP", "what is a regex") where MDN and Wikipedia win by
default and AI Overviews eat the click. Write the **decision** (401 vs 403,
SHA-256 vs bcrypt), never the definition.

### 7. Spanish routes `/es/` — the biggest and most expensive lever

Verified: `/tools/jwt-decoder` contains **not one word of Spanish** in the served
HTML. The i18n is client-side (zustand + `locales/*.json`), so the ~1550 translated
strings buy UX and zero SEO. Every competitor that ranks in Spanish uses a
dedicated language path (`utilipad.com/es/…`, `pinetools.com/es/`,
`alextoolset.com/es/…`); none uses client i18n.

The routing is the cheap part (`app/[lang]/`, `generateStaticParams` for
`["en","es"]`, and `lib/i18n-server.ts` already exists — currently dead code, 0
usages). The expensive part is content: `config/tool-content.ts` is English-only
by design, so it is 20 intros + ~80 steps + ~100 FAQ entries to write by hand.

Recommendation: **EN + `/es/` only**, never 8 locales, and start with the 6
highest-demand tools (json-formatter, jwt-decoder, base64, hash-generator,
uuid-generator, color-converter) rather than all 20. Machine-translating all 8
languages produces thin content ×7 and doorway-page risk.

Spanish keywords unlocked by this, all with weak SERPs: `formateador json online`,
`decodificador jwt online`, `convertir json a typescript`, `generador de
expresiones regulares` (add DNI/NIE/IBAN/Spanish-postcode presets — a
differentiator no English competitor can copy), `generador uuid online`,
`generador cron online`, `calculadora coste api openai`.

Note: Spanish regex queries return *tutorials*, not tools, so that one needs a
guide page with the tool embedded, not a tool page.

### 8. Analytics instrumentation

Umami records pageviews only — zero custom events (verified by grep). Without
these there is no baseline and no way to tell an acquisition problem from an
activation problem. The five that matter:

| Event | Where | Decision it enables |
| --- | --- | --- |
| `tool_output_copied` {tool} | `components/shared/copy-button.tsx` | The real moment of value. One file covers all 20 tools. Separates "arrived" from "was useful". |
| `ai_run` {endpoint, byok, status} | `lib/api/fetcher.ts` | Real AI demand, 429 rate, and what share already brings a key — the entire Pro business case. |
| `share_link_created` {tool, method} | `components/shared/share-button.tsx` | Does anyone actually share? |
| `share_link_opened` {tool} | `hooks/use-share-state.ts` | Viral coefficient K = opened / unique visitors. |
| `pro_waitlist_click` {source} | new CTA in settings + the 429 alert | The only way to measure willingness to pay without building a payment flow. |

Second wave: `tool_error`, `cross_tool_nav`, `pwa_installed`, `byok_key_saved`,
`command_palette_used`, `locale_changed` (this last one tells you whether the 8
languages justify localized routes at all).

Also known: `hooks/use-share-state.ts` calls `window.history.replaceState`, which
Umami patches — every visit from a share link is counted twice.

### 9. Monetisation

Recommendation: **ads (EthicalAds), not a Pro tier** — but with the numbers stated
honestly. EthicalAds requires 50k pageviews/month and pays ~$2.50 CPM, so 50k
pageviews is roughly $125/month. That is not much.

It still wins because implementation is one script and one slot, it needs no auth,
no payment flow, no AI cost exposure and no support surface; and above all it does
not contradict principle 4 of `CLAUDE.md` ("No barriers — no login, no auth, no
credit card"), which is the whole positioning you would launch on. AdSense is
disqualified on Core Web Vitals grounds (multiple third-party scripts, auction
latency, dynamic insertion) and on the privacy claim.

Conditions if adopted: fixed reserved slot dimensions (CLS = 0), lazy-loaded below
the fold, and the host added to `script-src`/`connect-src` in `next.config.ts`,
which is a strict allowlist today and would otherwise block it.

Pro stays a **fake door** until three signals line up at once: `pro_waitlist_click`
above 2% of users with an `ai_run`, 429 rate above 10%, and BYOK share above 15%.
Cheapest Pro-value test costs nothing: the BYOK key currently lives in memory only
(`lib/stores/ai-settings-store.ts` has no `persist`), so users re-paste it every
session. Persist it encrypted and measure whether recurrence rises.

---

## Smaller items, still open

- `lastmod` in `app/sitemap.ts` is the build timestamp for all 24 URLs. Google
  learns to ignore that. Use real per-tool dates.
- The entity graph in `app/layout.tsx` emits four loose blocks with no `@id`, so
  there are two distinct `SoftwareApplication` nodes on `/` and two `WebSite`
  nodes on tool pages. Consolidate into a `@graph` with stable `@id`s
  (`/#website`, `/#organization`, `/#software`).
- `safeJsonLd` is duplicated in four files. Unify on the one in `lib/metadata.tsx`.
- Author attribution is `"DevFlowAI Community"` (`lib/metadata.tsx`,
  `app/layout.tsx`), an organisation that does not exist. Use a `Person` entity
  (Alberto Guinda) with `sameAs` to GitHub / LinkedIn, referenced as `author`.
- `alternates.canonical` on the root layout leaks the home canonical into
  `/favorites`, `/history` and `/settings`. They are `noindex`, so the damage is
  contained, but `noindex` + a cross canonical is an anti-pattern.
- `preconnect` to `fonts.gstatic.com` is dead weight: `next/font/google`
  self-hosts and the CSP already sets `font-src 'self'`.
- `Organization.foundingDate: "2025"` should be `"2025-01-01"`.
- `lib/i18n-server.ts` is unused. Delete it, or use it when `/es/` lands.
- `lighthouse-budget.json` only defines `path: "/*"`; the heavy pages are
  `/tools/*` (js-tiktoken, recharts) and have no budget of their own.
- `HowTo` and `FAQPage` no longer produce rich results (Google retired them in
  2023). Keep them — they are valuable for GEO — but do not expect snippets.

---

## How to measure GEO

Do not measure traffic for this. Every two weeks, ask ChatGPT, Claude, Perplexity
and Gemini, verbatim: *"best free online JSON formatter that doesn't upload my
data"* and *"free alternative to it-tools"*, and count how many mention
devflowai.dev. The baseline today is almost certainly 0/4.
