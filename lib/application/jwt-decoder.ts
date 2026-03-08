// JWT Decoder Application Logic
// Zero dependencies — uses native atob() + JSON.parse()

import type {
  JwtParts,
  JwtValidation,
  JwtClaim,
  JwtResult,
} from "@/types/jwt-decoder";
import { STANDARD_CLAIMS } from "@/types/jwt-decoder";

// ─── Base64URL Decode ───

function base64UrlDecode(str: string): string {
  // Replace base64url chars with standard base64
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding if needed
  const pad = base64.length % 4;
  if (pad === 2) base64 += "==";
  else if (pad === 3) base64 += "=";

  try {
    // Decode base64 to binary string, then handle UTF-8
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    throw new Error("Invalid base64url encoding");
  }
}

function base64UrlToHex(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad === 2) base64 += "==";
  else if (pad === 3) base64 += "=";

  try {
    const binary = atob(base64);
    return Array.from(binary, (c) =>
      c.charCodeAt(0).toString(16).padStart(2, "0")
    ).join("");
  } catch {
    return str;
  }
}

// ─── Core Functions ───

/**
 * Decode a JWT token string into its three parts.
 * Does NOT verify the signature — this is a decoder, not a verifier.
 */
export function decodeJwt(token: string): JwtParts {
  const trimmed = token.trim();

  if (!trimmed) {
    throw new Error("Empty token");
  }

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    throw new Error(`Invalid JWT structure: expected 3 parts, got ${parts.length}`);
  }

  const [rawHeader, rawPayload, rawSignature] = parts as [string, string, string];

  let header: Record<string, unknown>;
  try {
    const decoded = base64UrlDecode(rawHeader);
    header = JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    throw new Error("Invalid JWT header: failed to decode or parse JSON");
  }

  let payload: Record<string, unknown>;
  try {
    const decoded = base64UrlDecode(rawPayload);
    payload = JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    throw new Error("Invalid JWT payload: failed to decode or parse JSON");
  }

  const signature = base64UrlToHex(rawSignature);

  return {
    header,
    payload,
    signature,
    raw: {
      header: rawHeader,
      payload: rawPayload,
      signature: rawSignature,
    },
  };
}

/**
 * Check if a JWT payload is expired.
 */
export function isExpired(payload: Record<string, unknown>): boolean {
  const exp = payload["exp"];
  if (typeof exp !== "number") return false;
  return Date.now() >= exp * 1000;
}

/**
 * Check if a JWT is not yet valid (nbf claim).
 */
export function isNotYetValid(payload: Record<string, unknown>): boolean {
  const nbf = payload["nbf"];
  if (typeof nbf !== "number") return false;
  return Date.now() < nbf * 1000;
}

/**
 * Get human-readable time until expiration (or since expiration).
 */
export function getExpiresIn(payload: Record<string, unknown>): string | null {
  const exp = payload["exp"];
  if (typeof exp !== "number") return null;

  const now = Date.now();
  const expiresAt = exp * 1000;
  const diffMs = expiresAt - now;
  const absDiff = Math.abs(diffMs);

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let timeStr: string;
  if (days > 0) {
    timeStr = `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    timeStr = `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    timeStr = `${minutes}m ${seconds % 60}s`;
  } else {
    timeStr = `${seconds}s`;
  }

  return diffMs > 0 ? `Expires in ${timeStr}` : `Expired ${timeStr} ago`;
}

/**
 * Format a Unix timestamp to ISO string.
 */
function formatTimestamp(value: unknown): string | null {
  if (typeof value !== "number") return null;
  try {
    return new Date(value * 1000).toISOString();
  } catch {
    return null;
  }
}

/**
 * Validate a decoded JWT and return validation details.
 */
export function validateJwt(parts: JwtParts): JwtValidation {
  const errors: string[] = [];
  const { header, payload } = parts;

  // Check algorithm
  const algorithm = typeof header["alg"] === "string" ? header["alg"] : null;
  if (!algorithm) {
    errors.push("Missing algorithm (alg) in header");
  }
  if (algorithm === "none") {
    errors.push("Insecure: algorithm is 'none' — signature is not verified");
  }

  // Check expiration
  const expired = isExpired(payload);
  if (expired) {
    errors.push("Token is expired");
  }

  // Check not-before
  const notYetValid = isNotYetValid(payload);
  if (notYetValid) {
    errors.push("Token is not yet valid (nbf claim is in the future)");
  }

  // Extract standard fields
  const issuer = typeof payload["iss"] === "string" ? payload["iss"] : null;
  const subject = typeof payload["sub"] === "string" ? payload["sub"] : null;
  const audience = (() => {
    const aud = payload["aud"];
    if (typeof aud === "string") return aud;
    if (Array.isArray(aud) && aud.every((a) => typeof a === "string")) return aud as string[];
    return null;
  })();

  return {
    isValid: errors.length === 0,
    isExpired: expired,
    isNotYetValid: notYetValid,
    expiresAt: formatTimestamp(payload["exp"]),
    issuedAt: formatTimestamp(payload["iat"]),
    notBefore: formatTimestamp(payload["nbf"]),
    algorithm,
    issuer,
    subject,
    audience,
    errors,
  };
}

/**
 * Format payload claims with annotations for standard claims.
 */
export function formatClaims(payload: Record<string, unknown>): JwtClaim[] {
  const claims: JwtClaim[] = [];

  for (const [key, value] of Object.entries(payload)) {
    const standardClaim = STANDARD_CLAIMS[key];

    if (standardClaim) {
      let status: "ok" | "warning" | "error" = "ok";

      if (key === "exp" && typeof value === "number") {
        status = isExpired(payload) ? "error" : "ok";
      }
      if (key === "nbf" && typeof value === "number") {
        status = isNotYetValid(payload) ? "warning" : "ok";
      }

      claims.push({
        key,
        value,
        label: standardClaim.label,
        description: standardClaim.descriptionKey,
        type: "standard",
        status,
      });
    } else {
      claims.push({
        key,
        value,
        label: key,
        description: "",
        type: "custom",
      });
    }
  }

  // Sort: standard claims first (in STANDARD_CLAIMS order), then custom alphabetically
  const standardOrder = Object.keys(STANDARD_CLAIMS);
  return claims.sort((a, b) => {
    if (a.type === "standard" && b.type === "custom") return -1;
    if (a.type === "custom" && b.type === "standard") return 1;
    if (a.type === "standard" && b.type === "standard") {
      return standardOrder.indexOf(a.key) - standardOrder.indexOf(b.key);
    }
    return a.key.localeCompare(b.key);
  });
}

/**
 * Process a JWT token and return a full result object.
 */
export function processJwt(token: string): JwtResult {
  const parts = decodeJwt(token);
  const validation = validateJwt(parts);
  const claims = formatClaims(parts.payload);

  return {
    id: crypto.randomUUID(),
    token,
    parts,
    validation,
    claims,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check if a string looks like a JWT (three base64url segments separated by dots).
 */
export function isJwtLike(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed.includes(".")) return false;
  const parts = trimmed.split(".");
  if (parts.length !== 3) return false;
  return parts.every((part) => part.length > 0 && /^[A-Za-z0-9_-]+$/.test(part));
}
