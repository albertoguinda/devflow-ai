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
  "jwt-decoder": {
    intro:
      "The JWT Decoder parses JSON Web Tokens and shows the decoded header, payload, and signature in a readable format. Paste a token to inspect its claims — issuer, expiry, subject, and scopes — entirely in your browser. It is built for debugging auth flows without sending sensitive tokens to a remote server.",
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
        text: "Inspect standard claims such as exp, iat, iss, and sub to debug your token.",
      },
      {
        name: "Copy what you need",
        text: "Copy the decoded payload or any individual claim for use in your tests.",
      },
    ],
    faq: [
      {
        q: "Does the JWT Decoder verify the signature?",
        a: "It decodes and displays the token contents. Verifying the signature requires the secret or public key; decoding shows the claims without validating the signature.",
      },
      {
        q: "Is my token sent anywhere?",
        a: "No. Decoding happens entirely in your browser. Because tokens are sensitive credentials, this matters — your token never leaves your device.",
      },
      {
        q: "Can I see when the token expires?",
        a: "Yes. The exp claim is decoded, so you can read the token's issued-at and expiry times.",
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
  base64: {
    intro:
      "The Base64 Encoder/Decoder converts text to and from Base64 in your browser. Encode strings for data URIs, API payloads, or config, and decode Base64 back to readable text — instantly and offline. It handles UTF-8 correctly, making it a quick way to inspect or produce Base64 without command-line tools.",
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
        q: "What is Base64 used for?",
        a: "Representing binary or text data as ASCII — common in data URIs, embedding images in CSS/HTML, email attachments, and API tokens.",
      },
      {
        q: "Can I decode a Base64 data URI?",
        a: "Yes. Paste the Base64 portion (the part after the comma) to decode its contents.",
      },
    ],
  },
  "hash-generator": {
    intro:
      "The Hash Generator computes cryptographic hashes — including SHA-256, SHA-1, and SHA-512 — from any text, right in your browser. Paste input and get the hex digest instantly using the native Web Crypto API, with nothing sent to a server. It is handy for checksums, fingerprinting, and verifying data integrity.",
    howTo: [
      {
        name: "Enter your text",
        text: "Paste or type the text you want to hash.",
      },
      {
        name: "Pick an algorithm",
        text: "Choose SHA-256, SHA-1, SHA-512, or another supported algorithm.",
      },
      {
        name: "Read the digest",
        text: "The hash is computed instantly and shown as a hexadecimal string.",
      },
      {
        name: "Copy the hash",
        text: "Copy the digest to your clipboard for checksums or comparisons.",
      },
    ],
    faq: [
      {
        q: "Which hash algorithms are supported?",
        a: "Common algorithms including SHA-256, SHA-1, and SHA-512 via the Web Crypto API. SHA-256 is recommended for most uses.",
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
};

export function getToolContent(slug: string): ToolContent | undefined {
  return TOOL_CONTENT[slug];
}
