/**
 * Single implementation of the JSON-LD serializer.
 *
 * It lived copy-pasted in three files (`app/layout.tsx`,
 * `app/(marketing)/layout.tsx` and `lib/metadata.tsx`). Three copies of an
 * escaping function is three chances for one of them to drift and stop
 * escaping — which in a `dangerouslySetInnerHTML` is an injection.
 *
 * It sits in its own module rather than in `lib/metadata.tsx` because client
 * components need it too, and importing `lib/metadata` from the client would
 * drag the whole per-tool title and description tables into the browser bundle.
 */

/** Serialize JSON-LD safely — escapes the characters that could break out of the script tag. */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
