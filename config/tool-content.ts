/**
 * SEO/GEO content per tool: intro prose, step-by-step how-to, and FAQ.
 * Rendered server-side (crawlable) by <ToolSeoContent /> and emitted as
 * HowTo + FAQPage JSON-LD. English-only pilot; localized routes come later.
 */

export interface HowToStep {
  name: string;
  text: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ToolContent {
  /** 2–3 sentence descriptive intro, keyword-rich but natural. */
  intro: string;
  howTo: HowToStep[];
  faq: FaqItem[];
}

export const TOOL_CONTENT: Record<string, ToolContent> = {
  "prompt-analyzer": {
    intro:
      "The Prompt Analyzer scores your LLM prompts for clarity, specificity, and safety, and flags prompt-injection risks before they reach production. Paste a prompt to get a quality score, concrete improvement suggestions, and a safer rewrite. It is built for developers shipping features on top of AI APIs who want reliable, hard-to-hijack prompts.",
    howTo: [
      {
        name: "Paste your prompt",
        text: "Enter the prompt you send to your LLM.",
      },
      {
        name: "Run the analysis",
        text: "Get a quality score plus a breakdown across clarity, specificity, context, and injection resistance.",
      },
      {
        name: "Review issues and the rewrite",
        text: "See flagged weaknesses and prompt-injection vectors, with an improved version you can adopt.",
      },
      {
        name: "Iterate",
        text: "Refine and re-run until the score and safety are where you want them.",
      },
    ],
    faq: [
      {
        q: "Is the Prompt Analyzer free?",
        a: "Yes. It is free and open source. AI analysis uses free providers by default, with optional bring-your-own-key.",
      },
      {
        q: "What does it check for?",
        a: "Clarity, specificity, context, and safety — including prompt-injection resistance — producing a score and actionable fixes.",
      },
      {
        q: "Does it detect prompt injection?",
        a: "Yes. It flags common injection patterns and instruction-override attempts so you can harden the prompt.",
      },
      {
        q: "Is my prompt sent to a server?",
        a: "The AI analysis calls the provider you select. Treat any sensitive prompt accordingly, and use test data where possible.",
      },
      {
        q: "Will it rewrite my prompt?",
        a: "Yes. It suggests an improved version alongside an explanation of what changed and why.",
      },
    ],
  },
  "code-review": {
    intro:
      "The Code Review Assistant analyzes a code snippet for bugs, anti-patterns, and code smells, and suggests concrete refactors. Paste TypeScript, JavaScript, Python, or other code to get feedback by line, a complexity score, and a summary. It is a fast second pair of eyes before you open a pull request.",
    howTo: [
      {
        name: "Paste your code",
        text: "Drop in the snippet you want reviewed, optionally with a language hint.",
      },
      {
        name: "Run the review",
        text: "Get issues by line, a complexity score, and a plain-language summary.",
      },
      {
        name: "Apply the suggestions",
        text: "Review the recommended refactors and adopt what fits.",
      },
      {
        name: "Re-check",
        text: "Paste the revised code to confirm the issues are resolved.",
      },
    ],
    faq: [
      {
        q: "Which languages are supported?",
        a: "TypeScript, JavaScript, Python, and other common languages; results are best for mainstream syntax.",
      },
      {
        q: "Is it free?",
        a: "Yes. It is free and open source. AI review uses free providers by default, with optional bring-your-own-key.",
      },
      {
        q: "Does my code get uploaded?",
        a: "The AI review sends the snippet to the provider you select. Avoid pasting secrets or proprietary code you cannot share.",
      },
      {
        q: "Will it rewrite my code?",
        a: "It suggests refactors and can provide a refactored snippet, but it will not rewrite working code with low complexity.",
      },
      {
        q: "Can it replace a human review?",
        a: "No. It catches common issues fast, but human review is still needed for design and domain logic.",
      },
    ],
  },
  "cost-calculator": {
    intro:
      "The API Cost Calculator estimates and compares what your AI usage costs across providers like OpenAI, Anthropic, and Google. Enter your token volumes and model choices to see a per-model breakdown and a monthly projection. It helps you pick the most cost-effective model before the bill arrives.",
    howTo: [
      {
        name: "Enter your usage",
        text: "Provide input and output token volumes and how often you call the API.",
      },
      {
        name: "Pick models to compare",
        text: "Select the provider models you are considering.",
      },
      {
        name: "Read the breakdown",
        text: "See per-request and projected monthly costs side by side.",
      },
      {
        name: "Optimize",
        text: "Use the comparison to choose the cheapest model that meets your quality bar.",
      },
    ],
    faq: [
      {
        q: "Is the calculator free?",
        a: "Yes. It is free and open source, with no login required.",
      },
      {
        q: "Which providers does it cover?",
        a: "Major providers including OpenAI, Anthropic, and Google, across common models.",
      },
      {
        q: "Are the prices current?",
        a: "Prices are based on published rates and can change. Always confirm against the provider's official pricing before budgeting.",
      },
      {
        q: "Does it send my data anywhere?",
        a: "No. Calculations run locally in your browser from the numbers you enter.",
      },
      {
        q: "Can it project monthly costs?",
        a: "Yes. Enter your usage pattern to get an estimated monthly cost per model.",
      },
    ],
  },
  "token-visualizer": {
    intro:
      "The Token Visualizer shows exactly how AI models tokenize your text, highlighting each token in real time as you type. See the token count, boundaries, and an estimated cost so you can trim prompts and stay within context limits. Everything runs in your browser.",
    howTo: [
      {
        name: "Type or paste text",
        text: "Enter the prompt or text you want to analyze.",
      },
      {
        name: "Watch the tokens",
        text: "Tokens are highlighted and counted live as you edit.",
      },
      {
        name: "Check count and cost",
        text: "Read the total token count and estimated cost per model.",
      },
      {
        name: "Optimize your prompt",
        text: "Trim or rephrase to reduce tokens and fit your context window.",
      },
    ],
    faq: [
      {
        q: "Is the Token Visualizer free?",
        a: "Yes. It is free and open source with no login.",
      },
      {
        q: "Which models are supported?",
        a: "Common GPT and Claude tokenization schemes, computed client-side.",
      },
      {
        q: "Is my text sent to a server?",
        a: "No. Tokenization runs locally in your browser; your text never leaves your device.",
      },
      {
        q: "Why do token counts matter?",
        a: "Tokens drive both cost and context limits; fewer tokens mean cheaper calls and more room for content.",
      },
      {
        q: "Is the count exact?",
        a: "It is a close estimate using standard tokenizers; a provider's exact count can vary slightly by model version.",
      },
    ],
  },
  "context-manager": {
    intro:
      "The Context Manager helps you assemble and optimize the context you send to an LLM. Add chunks, order them by relevance, and preview exactly what the model will receive, with intelligent chunking to fit your window. Export the result as XML or JSON for your pipeline.",
    howTo: [
      {
        name: "Add your content",
        text: "Paste or drop the pieces of context you want to include.",
      },
      {
        name: "Order by relevance",
        text: "Arrange chunks so the most important context comes first.",
      },
      {
        name: "Preview the window",
        text: "See the assembled context and how it fits your token budget.",
      },
      {
        name: "Export",
        text: "Copy or export the optimized context as XML or JSON.",
      },
    ],
    faq: [
      {
        q: "What does the Context Manager do?",
        a: "It helps you build, order, and trim the context you send to an LLM so it fits the window and prioritizes what matters.",
      },
      {
        q: "Is it free?",
        a: "Yes. It is free and open source, with no login.",
      },
      {
        q: "Is my content uploaded?",
        a: "No. Organization and preview run locally in your browser.",
      },
      {
        q: "Can it export the context?",
        a: "Yes, as XML or JSON for use in your prompts or pipeline.",
      },
      {
        q: "Why order chunks by relevance?",
        a: "Models weight earlier context more and windows are limited, so ordering improves answers and avoids truncation.",
      },
    ],
  },
  "regex-humanizer": {
    intro:
      "The Regex Humanizer explains regular expressions in plain English. Paste a pattern and get a readable breakdown of what it matches, so you can understand, debug, or document a regex without deciphering the syntax by hand. It can optionally use AI to describe complex patterns and flag common mistakes.",
    howTo: [
      {
        name: "Paste your regex",
        text: "Enter the regular expression you want to understand.",
      },
      {
        name: "Read the explanation",
        text: "The tool breaks the pattern into parts and describes what each one matches in plain language.",
      },
      {
        name: "Review examples and warnings",
        text: "See sample strings that match and don't match, plus warnings about risky constructs.",
      },
      {
        name: "Refine your pattern",
        text: "Use the explanation to fix or simplify your regex, then copy it back into your code.",
      },
    ],
    faq: [
      {
        q: "What does the Regex Humanizer do?",
        a: "It translates a regular expression into a plain-English explanation of what it matches, part by part.",
      },
      {
        q: "Does it work without AI?",
        a: "The core breakdown works locally. Optional AI enhancement adds richer explanations and edge-case warnings using free providers or your own key.",
      },
      {
        q: "Is my pattern sent to a server?",
        a: "Only if you enable the optional AI feature. The basic explanation runs in your browser; AI calls go to the provider you select.",
      },
      {
        q: "Which regex flavor does it target?",
        a: "JavaScript/ECMAScript regex syntax, the most common flavor in web development.",
      },
      {
        q: "Can it warn about slow or unsafe patterns?",
        a: "The AI mode flags common risky constructs, such as nested quantifiers that can cause catastrophic backtracking (ReDoS).",
      },
    ],
  },
  "dto-matic": {
    intro:
      "DTO-Matic turns a raw JSON API response into production-ready TypeScript: interfaces, domain entities, mapper functions, and Zod schemas. Paste JSON and get clean, Clean-Architecture-friendly code with date detection and configurable naming. It removes minutes of boilerplate per endpoint.",
    howTo: [
      {
        name: "Paste your JSON",
        text: "Drop in a sample JSON response from your API.",
      },
      {
        name: "Choose outputs",
        text: "Pick interfaces, entities, mappers, or Zod schemas and a naming convention.",
      },
      {
        name: "Copy the generated code",
        text: "Grab the TypeScript output for your project.",
      },
      {
        name: "Wire it in",
        text: "Drop the types and mappers into your codebase.",
      },
    ],
    faq: [
      {
        q: "What does DTO-Matic generate?",
        a: "TypeScript interfaces, domain entities, DTO-to-entity mappers, and Zod schemas from a JSON sample.",
      },
      {
        q: "Is it free?",
        a: "Yes. It is free and open source with no login.",
      },
      {
        q: "Is my JSON sent to a server?",
        a: "No. Code generation runs locally in your browser.",
      },
      {
        q: "Does it detect dates?",
        a: "Yes. It recognizes date-like fields and types them appropriately.",
      },
      {
        q: "Which naming conventions are supported?",
        a: "Multiple conventions so the generated code matches your codebase style.",
      },
    ],
  },
  "cron-builder": {
    intro:
      "The Cron Builder lets you create cron expressions visually, without memorizing the syntax. Pick fields or a preset and get a human-readable explanation plus a preview of the next run times. It is ideal for DevOps and backend work with scheduled jobs.",
    howTo: [
      {
        name: "Choose a schedule",
        text: "Use the visual fields or start from a common preset (hourly, daily, weekly).",
      },
      {
        name: "Read the explanation",
        text: "See a plain-language description of when the job runs.",
      },
      {
        name: "Preview next runs",
        text: "Check the upcoming execution times to confirm it is right.",
      },
      {
        name: "Copy the expression",
        text: "Copy the cron string into your scheduler.",
      },
    ],
    faq: [
      {
        q: "Is the Cron Builder free?",
        a: "Yes. It is free and open source, with no login.",
      },
      {
        q: "Do I need to know cron syntax?",
        a: "No. Build it visually and the tool generates and explains the expression for you.",
      },
      {
        q: "Does it show the next run times?",
        a: "Yes. It previews upcoming executions so you can verify the schedule.",
      },
      {
        q: "Is my data sent anywhere?",
        a: "No. Everything is computed locally in your browser.",
      },
      {
        q: "Which cron format does it use?",
        a: "Standard 5-field cron syntax used by most schedulers and cron daemons.",
      },
    ],
  },
  "tailwind-sorter": {
    intro:
      "The Tailwind Sorter cleans up a string of Tailwind CSS classes: sorted by category, duplicates removed, and variants ordered consistently. Paste your class list and get tidy, readable output in single-line, multi-line, or grouped format. It keeps your markup consistent across a codebase.",
    howTo: [
      {
        name: "Paste your classes",
        text: "Drop in any string of Tailwind utility classes.",
      },
      {
        name: "Sort",
        text: "The tool orders them by category and removes duplicates.",
      },
      {
        name: "Pick a format",
        text: "Choose single-line, multi-line, or grouped output.",
      },
      {
        name: "Copy the result",
        text: "Copy the sorted classes back into your markup.",
      },
    ],
    faq: [
      {
        q: "Is the Tailwind Sorter free?",
        a: "Yes. It is free and open source with no login.",
      },
      {
        q: "How does it order classes?",
        a: "By category (layout, spacing, typography, and so on) with responsive variants ordered small to large.",
      },
      {
        q: "Does it remove duplicate classes?",
        a: "Yes. Duplicates are stripped so your class list stays clean.",
      },
      {
        q: "Is my code sent to a server?",
        a: "No. Sorting runs entirely in your browser.",
      },
      {
        q: "Which Tailwind version does it target?",
        a: "Standard Tailwind utility naming; it sorts by category regardless of your exact setup.",
      },
    ],
  },
  "variable-name-wizard": {
    intro:
      "The Variable Name Wizard suggests clear variable names from a description and converts existing names between conventions like camelCase, PascalCase, snake_case, and kebab-case. Describe what you are naming and get type-aware suggestions that follow best practices. It is a quick fix for naming friction.",
    howTo: [
      {
        name: "Describe or paste a name",
        text: "Enter a description of what you are naming, or an existing identifier.",
      },
      {
        name: "Get suggestions",
        text: "Receive multiple clear, convention-following name options.",
      },
      {
        name: "Convert conventions",
        text: "Switch any name between camelCase, snake_case, kebab-case, and more.",
      },
      {
        name: "Copy your pick",
        text: "Copy the format you need into your code.",
      },
    ],
    faq: [
      {
        q: "What does the Variable Name Wizard do?",
        a: "It generates clear names from a description and converts names between eight naming conventions.",
      },
      {
        q: "Is it free?",
        a: "Yes. It is free and open source, with no login.",
      },
      {
        q: "Is my input sent to a server?",
        a: "The core conversions run locally; optional AI suggestions call the provider you select.",
      },
      {
        q: "Which conventions are supported?",
        a: "camelCase, PascalCase, snake_case, kebab-case, and others, with automatic detection of the input's convention.",
      },
      {
        q: "Does it avoid generic names?",
        a: "Yes. It steers away from vague names like data or value in favor of descriptive, intent-revealing ones.",
      },
    ],
  },
  "json-formatter": {
    intro:
      "The JSON Formatter beautifies, validates, and minifies JSON directly in your browser. Paste messy or minified JSON and get clean, indented, readable output instantly — your data never leaves your machine. It pinpoints syntax errors so you can debug API responses, config files, and log payloads fast.",
    howTo: [
      {
        name: "Paste your JSON",
        text: "Paste raw, minified, or malformed JSON into the input area.",
      },
      {
        name: "Format or minify",
        text: "Click Format to pretty-print with indentation, or Minify to compact it into a single line.",
      },
      {
        name: "Fix any errors",
        text: "If the JSON is invalid, the tool highlights the location and reason so you can correct it.",
      },
      {
        name: "Copy the result",
        text: "Copy the formatted or minified output to your clipboard with one click.",
      },
    ],
    faq: [
      {
        q: "Is the JSON Formatter free?",
        a: "Yes. It is 100% free and open source, with no login, no API key, and no usage limits.",
      },
      {
        q: "Is my JSON sent to a server?",
        a: "No. All formatting and validation run locally in your browser, so your data never leaves your device.",
      },
      {
        q: "Can it handle large JSON files?",
        a: "Yes. Processing happens client-side; typical API responses format instantly, while very large files depend on your browser's available memory.",
      },
      {
        q: "Does it validate JSON?",
        a: "Yes. Invalid JSON is flagged with the error location and reason so you can fix syntax issues quickly.",
      },
      {
        q: "Can it minify JSON as well as beautify it?",
        a: "Yes. Switch to Minify to strip whitespace and produce compact JSON for production or transport.",
      },
    ],
  },
  base64: {
    intro:
      "The Base64 Encoder/Decoder converts text to and from Base64 in your browser. Encode strings for data URIs, API payloads, or config, and decode Base64 back to readable text — instantly and offline. It handles UTF-8 correctly and supports URL-safe variants, making it a quick way to inspect or produce Base64 without command-line tools.",
    howTo: [
      {
        name: "Choose a mode",
        text: "Select Encode to convert text to Base64, or Decode to convert Base64 back to text.",
      },
      {
        name: "Enter your input",
        text: "Paste the text or Base64 string into the input area.",
      },
      {
        name: "Get the result",
        text: "The converted output appears instantly as you type.",
      },
      {
        name: "Copy the output",
        text: "Copy the encoded or decoded result to your clipboard with one click.",
      },
    ],
    faq: [
      {
        q: "Is the Base64 tool free?",
        a: "Yes. It is free and open source, with no login and no limits.",
      },
      {
        q: "Is my data uploaded to a server?",
        a: "No. Encoding and decoding run locally in your browser; nothing is sent to a server.",
      },
      {
        q: "Does it support UTF-8, accents, and emoji?",
        a: "Yes. It correctly handles UTF-8 text, including non-ASCII characters and emoji.",
      },
      {
        q: "What is the URL-safe variant?",
        a: "A Base64 variant that replaces + and / with - and _ so the output is safe in URLs and filenames.",
      },
      {
        q: "Can I decode a Base64 data URI?",
        a: "Yes. Paste the Base64 portion (the part after the comma) to decode its contents.",
      },
    ],
  },
  "uuid-generator": {
    intro:
      "The UUID Generator creates universally unique identifiers in every major version — v1, v4, v7, nil, and max — with formats like standard, uppercase, no-hyphens, braces, and URN. Generate one or up to a thousand at once, and validate or parse any UUID to read its version, variant, and timestamp. It runs entirely in your browser.",
    howTo: [
      {
        name: "Pick a version",
        text: "Choose UUID v1, v4, v7, nil, or max.",
      },
      {
        name: "Choose a format and count",
        text: "Select the output format and how many to generate.",
      },
      {
        name: "Generate",
        text: "Get your UUIDs instantly, single or in bulk.",
      },
      {
        name: "Copy or validate",
        text: "Copy the results, or paste a UUID to validate and parse it.",
      },
    ],
    faq: [
      {
        q: "Which UUID versions are supported?",
        a: "v1, v4, v7, nil, and max, in multiple output formats.",
      },
      {
        q: "Is it free?",
        a: "Yes. It is free and open source with no login and no limits.",
      },
      {
        q: "Are the UUIDs generated locally?",
        a: "Yes. Generation, validation, and parsing all happen in your browser.",
      },
      {
        q: "Which version should I use?",
        a: "v4 for general random IDs, v7 when you want time-ordered IDs for databases; v1 is time-based with node info.",
      },
      {
        q: "Can I generate many at once?",
        a: "Yes. Bulk mode generates up to 1000 UUIDs in one go.",
      },
    ],
  },
  "git-commit-generator": {
    intro:
      "The Git Commit Generator helps you write commit messages that follow the Conventional Commits spec. Pick a type, add a scope and description, and get real-time validation with a character counter and breaking-change support. It keeps your history clean and machine-readable for changelogs and semantic release.",
    howTo: [
      {
        name: "Pick a commit type",
        text: "Choose from types like feat, fix, docs, refactor, and more.",
      },
      {
        name: "Add scope and description",
        text: "Enter an optional scope and a concise description.",
      },
      {
        name: "Add details if needed",
        text: "Include a body, footer, breaking-change note, or issue reference.",
      },
      {
        name: "Copy the message",
        text: "Copy the validated Conventional Commit message.",
      },
    ],
    faq: [
      {
        q: "What format does it produce?",
        a: "Conventional Commits — type(scope): description — with optional body and footer.",
      },
      {
        q: "Is it free?",
        a: "Yes. It is free and open source, with no login.",
      },
      {
        q: "Is my input sent to a server?",
        a: "No. The message is built and validated locally in your browser.",
      },
      {
        q: "Why use Conventional Commits?",
        a: "They enable automated changelogs and semantic versioning, and make history easier to scan.",
      },
      {
        q: "Can it parse an existing commit?",
        a: "Yes. Paste a commit to extract its type, scope, and description.",
      },
    ],
  },
  "http-status-finder": {
    intro:
      "The HTTP Status Finder is a searchable reference for HTTP status codes. Look up any code by number or keyword, filter by 1xx–5xx category, and read what it means, when to use it, and real examples. It is a quick companion for API developers and backend engineers.",
    howTo: [
      {
        name: "Search a code or keyword",
        text: "Type a status number like 404 or a keyword like 'redirect'.",
      },
      {
        name: "Filter by category",
        text: "Narrow to 1xx, 2xx, 3xx, 4xx, or 5xx.",
      },
      {
        name: "Read the details",
        text: "See the meaning, when to use it, and real-world examples.",
      },
      {
        name: "Use it in your API",
        text: "Apply the right status code to your response.",
      },
    ],
    faq: [
      {
        q: "Is the HTTP Status Finder free?",
        a: "Yes. It is free and open source with no login.",
      },
      {
        q: "How many status codes are included?",
        a: "55+ codes across all categories, with descriptions and usage guidance.",
      },
      {
        q: "Can I search by keyword?",
        a: "Yes. Search by code number or by keyword such as 'not found' or 'rate limit'.",
      },
      {
        q: "Does it explain when to use each code?",
        a: "Yes. Each entry includes when-to-use guidance and real examples.",
      },
      {
        q: "Is any data sent to a server?",
        a: "No. The reference is bundled and runs entirely in your browser.",
      },
    ],
  },
  "hash-generator": {
    intro:
      "The Hash Generator computes cryptographic hashes — including SHA-256, SHA-1, SHA-384, SHA-512, and MD5 — from any text, right in your browser. Paste input and get the hex or Base64 digest instantly using the native Web Crypto API, with nothing sent to a server. It also supports HMAC and constant-time hash comparison, making it handy for checksums, fingerprinting, and verifying data integrity.",
    howTo: [
      {
        name: "Enter your text",
        text: "Paste or type the text you want to hash.",
      },
      {
        name: "Pick an algorithm",
        text: "Choose SHA-256, SHA-1, SHA-384, SHA-512, or MD5 — or generate all at once.",
      },
      {
        name: "Read the digest",
        text: "The hash is computed instantly and shown as hex or Base64.",
      },
      {
        name: "Copy the hash",
        text: "Copy the digest to your clipboard for checksums or comparisons.",
      },
    ],
    faq: [
      {
        q: "Which hash algorithms are supported?",
        a: "MD5, SHA-1, SHA-256, SHA-384, and SHA-512 via the Web Crypto API, plus HMAC with a secret key. SHA-256 is recommended for most uses.",
      },
      {
        q: "Is my input sent to a server?",
        a: "No. Hashing runs locally using the browser's native crypto, so your input never leaves your device.",
      },
      {
        q: "Should I use MD5 or SHA-1 for security?",
        a: "No. MD5 and SHA-1 are broken for security purposes. Use SHA-256 or stronger for anything security-sensitive; older algorithms are only for non-security checksums.",
      },
      {
        q: "Can I hash passwords with this tool?",
        a: "Not for storage. Password storage needs a slow, salted key-derivation function like bcrypt or Argon2 — not a plain hash. This tool is for checksums and fingerprints.",
      },
      {
        q: "Is the output always the same for the same input?",
        a: "Yes. The same input and algorithm always produce the same digest, which is exactly what makes hashes useful for verification.",
      },
    ],
  },
  "jwt-decoder": {
    intro:
      "The JWT Decoder parses JSON Web Tokens and shows the decoded header, payload, and signature in a readable format. Paste a token to inspect its claims — issuer, expiry, subject, and scopes — entirely in your browser. It auto-detects tokens on paste, flags expired or not-yet-valid tokens, and warns about insecure algorithms like 'none'.",
    howTo: [
      {
        name: "Paste your JWT",
        text: "Paste the full token (header.payload.signature) into the input.",
      },
      {
        name: "Read the decoded claims",
        text: "The header and payload are Base64URL-decoded and displayed as formatted JSON.",
      },
      {
        name: "Check expiry and claims",
        text: "Inspect standard claims such as exp, nbf, iat, iss, and sub to debug your token.",
      },
      {
        name: "Copy what you need",
        text: "Copy the decoded payload or any individual claim for use in your tests.",
      },
    ],
    faq: [
      {
        q: "Does the JWT Decoder verify the signature?",
        a: "It decodes and displays the token contents and flags insecure algorithms. Verifying the signature requires the secret or public key; decoding shows the claims without validating the signature.",
      },
      {
        q: "Is my token sent anywhere?",
        a: "No. Decoding happens entirely in your browser. Because tokens are sensitive credentials, this matters — your token never leaves your device.",
      },
      {
        q: "Can I see when the token expires?",
        a: "Yes. The exp and nbf claims are decoded and validated, with badges for expired or not-yet-valid tokens.",
      },
      {
        q: "What token format is supported?",
        a: "Standard JWTs using Base64URL-encoded header and payload (JWS), the format used by most authentication systems.",
      },
      {
        q: "Is it safe to decode production tokens?",
        a: "Decoding is local-only, but treat any real token as a secret. Prefer test tokens and never share a valid production token.",
      },
    ],
  },
  "color-converter": {
    intro:
      "The Color Converter transforms colors between HEX, RGB, HSL, OKLCH, and HWB with a live preview. It includes a WCAG contrast checker for accessibility and a palette generator with complementary, analogous, triadic, and shade harmonies. All conversions use pure math with no dependencies.",
    howTo: [
      {
        name: "Enter a color",
        text: "Type a value in any format, or use the native color picker.",
      },
      {
        name: "Read every format",
        text: "See the equivalent HEX, RGB, HSL, OKLCH, and HWB values.",
      },
      {
        name: "Check contrast",
        text: "Use the WCAG checker to verify accessible text and background pairs.",
      },
      {
        name: "Copy what you need",
        text: "Copy any format, or generate a matching palette.",
      },
    ],
    faq: [
      {
        q: "Which color formats are supported?",
        a: "HEX, RGB, HSL, OKLCH, and HWB, converted live in both directions.",
      },
      {
        q: "Is the Color Converter free?",
        a: "Yes. It is free and open source, with no login.",
      },
      {
        q: "Does it check accessibility?",
        a: "Yes. The built-in WCAG contrast checker verifies whether a color pair meets AA and AAA thresholds.",
      },
      {
        q: "Is my input sent to a server?",
        a: "No. All conversions run locally in your browser.",
      },
      {
        q: "Can it generate a palette?",
        a: "Yes. It builds complementary, analogous, triadic, and shade palettes from your base color.",
      },
    ],
  },
  "diff-comparer": {
    intro:
      "The Diff Comparer highlights the differences between two texts line by line using an LCS algorithm. View results unified or side by side, with added lines in green and removed lines in red, plus a stats summary. It is a fast way to compare configs, snippets, or drafts without git.",
    howTo: [
      {
        name: "Paste both texts",
        text: "Enter the original and the changed text.",
      },
      {
        name: "Choose a view",
        text: "Switch between unified and side-by-side layouts.",
      },
      {
        name: "Read the diff",
        text: "See added, removed, and unchanged lines color-coded.",
      },
      {
        name: "Copy the output",
        text: "Copy the formatted diff for sharing or notes.",
      },
    ],
    faq: [
      {
        q: "Is the Diff Comparer free?",
        a: "Yes. It is free and open source with no login.",
      },
      {
        q: "How does it compute the diff?",
        a: "With an LCS-based algorithm that finds the optimal line-by-line differences.",
      },
      {
        q: "Is my text uploaded?",
        a: "No. The comparison runs entirely in your browser.",
      },
      {
        q: "Can I see it side by side?",
        a: "Yes. Both unified and side-by-side views are available.",
      },
      {
        q: "Does it show diff stats?",
        a: "Yes. It reports added, removed, and unchanged line counts.",
      },
    ],
  },
  "password-generator": {
    intro:
      "The Password Generator creates strong, truly random passwords using the browser's cryptographic RNG. Configure length and character types, exclude ambiguous characters, and watch a live strength meter with entropy and estimated crack time. Batch mode produces several at once — nothing ever leaves your device.",
    howTo: [
      {
        name: "Set the length",
        text: "Choose a length between 8 and 128 characters.",
      },
      {
        name: "Pick character types",
        text: "Enable uppercase, lowercase, numbers, and symbols, and optionally exclude ambiguous characters.",
      },
      {
        name: "Generate",
        text: "Get a cryptographically secure password with a strength score.",
      },
      {
        name: "Copy it",
        text: "Copy the password, or generate a batch at once.",
      },
    ],
    faq: [
      {
        q: "Are the passwords secure?",
        a: "Yes. They are generated with crypto.getRandomValues(), the browser's cryptographic random source — not Math.random().",
      },
      {
        q: "Is the Password Generator free?",
        a: "Yes. It is free and open source with no login.",
      },
      {
        q: "Is anything sent to a server?",
        a: "No. Passwords are generated locally and never leave your device.",
      },
      {
        q: "What makes a strong password?",
        a: "Length and character variety drive entropy; the built-in meter estimates strength and crack time so you can choose well.",
      },
      {
        q: "Can I generate several at once?",
        a: "Yes. Batch mode creates multiple passwords in a single click.",
      },
    ],
  },
};

export function getToolContent(slug: string): ToolContent | undefined {
  return TOOL_CONTENT[slug];
}
