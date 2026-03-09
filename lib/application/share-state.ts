// Share State — encode/decode tool state for URL sharing
// Uses CompressionStream (native) with base64url fallback

export interface SharePayload {
  tool: string;
  state: Record<string, string>;
  v: number; // version for future compat
}

const SHARE_VERSION = 1;

// ─── Base64URL helpers (UTF-8 safe) ───

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...Array.from(bytes.slice(i, i + chunkSize)));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad === 2) base64 += "==";
  else if (pad === 3) base64 += "=";
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// ─── Compression (CompressionStream API) ───

async function compress(data: string): Promise<Uint8Array> {
  const encoded = new TextEncoder().encode(data);
  const stream = new Blob([encoded.buffer as ArrayBuffer])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

async function decompress(data: Uint8Array): Promise<string> {
  const stream = new Blob([data.buffer as ArrayBuffer])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(result);
}

function uint8ToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...Array.from(bytes.slice(i, i + chunkSize)));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUint8(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad === 2) base64 += "==";
  else if (pad === 3) base64 += "=";
  const binary = atob(base64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function supportsCompressionStream(): boolean {
  return typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";
}

// ─── Public API ───

/**
 * Encode tool state into a URL-safe string.
 * Uses gzip compression when available, plain base64url otherwise.
 * Format: "c." + compressed OR "p." + plain (prefix indicates encoding)
 */
export async function encodeState(toolSlug: string, state: Record<string, string>): Promise<string> {
  const payload: SharePayload = { tool: toolSlug, state, v: SHARE_VERSION };
  const json = JSON.stringify(payload);

  if (supportsCompressionStream()) {
    try {
      const compressed = await compress(json);
      return "c." + uint8ToBase64Url(compressed);
    } catch {
      // Fallback to plain
    }
  }

  return "p." + toBase64Url(json);
}

/**
 * Decode a URL-safe string back into tool state.
 * Returns null if decoding fails (invalid data, wrong version, etc.)
 */
export async function decodeState(encoded: string): Promise<SharePayload | null> {
  if (!encoded || encoded.length < 3) return null;

  const prefix = encoded.slice(0, 2);
  const data = encoded.slice(2);

  try {
    let json: string;

    if (prefix === "c.") {
      const bytes = base64UrlToUint8(data);
      json = await decompress(bytes);
    } else if (prefix === "p.") {
      json = fromBase64Url(data);
    } else {
      return null;
    }

    const payload = JSON.parse(json) as unknown;

    // Validate structure
    if (
      typeof payload !== "object" ||
      payload === null ||
      !("tool" in payload) ||
      !("state" in payload) ||
      !("v" in payload)
    ) {
      return null;
    }

    const p = payload as SharePayload;
    if (typeof p.tool !== "string" || typeof p.state !== "object" || p.state === null) {
      return null;
    }

    return p;
  } catch {
    return null;
  }
}

/**
 * Build a full share URL for a tool state.
 */
export function buildShareUrl(base: string, hash: string): string {
  const url = new URL(base);
  url.hash = hash;
  return url.toString();
}

/**
 * Extract the share hash from the current URL.
 */
export function getShareHash(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash || hash.length < 4) return null;
  // Remove leading "#"
  return hash.slice(1);
}

/**
 * Maximum safe URL length (conservative, works across browsers)
 */
export const MAX_SHARE_LENGTH = 4000;

/**
 * Check if a share string is within safe URL limits.
 */
export function isShareSafe(encoded: string): boolean {
  return encoded.length <= MAX_SHARE_LENGTH;
}
