// UUID Generator Application Logic

import type {
  UuidConfig,
  UuidResult,
  UuidVersion,
  UuidFormat,
  UuidValidation,
  UuidInfo,
  BinaryPart,
  UuidNamespace,
} from "@/types/uuid-generator";
import { DEFAULT_UUID_CONFIG, UUID_NAMESPACES } from "@/types/uuid-generator";

// UUID constants
const NIL_UUID = "00000000-0000-0000-0000-000000000000";
const MAX_UUID = "ffffffff-ffff-ffff-ffff-ffffffffffff";

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/-/g, "");
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Convert bytes to UUID string
 */
function bytesToUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Generates a UUID v5 (SHA-1 based, deterministic) using Web Crypto API.
 * Same namespace + name always produces the same UUID.
 */
export async function generateUuidV5(namespace: string, name: string): Promise<string> {
  const nsBytes = hexToBytes(namespace);
  const nameBytes = new TextEncoder().encode(name);
  const data = new Uint8Array(nsBytes.length + nameBytes.length);
  data.set(nsBytes);
  data.set(nameBytes, nsBytes.length);

  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashBytes = new Uint8Array(hashBuffer).slice(0, 16);

  // Set version to 5
  hashBytes[6] = (hashBytes[6]! & 0x0f) | 0x50;
  // Set variant to RFC 4122
  hashBytes[8] = (hashBytes[8]! & 0x3f) | 0x80;

  return bytesToUuid(hashBytes);
}

/**
 * Simple MD5 for UUID v3 (vanilla implementation, no dependencies).
 * Only used for UUID v3 generation — NOT for security purposes.
 */
function md5(input: Uint8Array): Uint8Array {
  // Minimal MD5 — adapted from RFC 1321
  const K = new Uint32Array([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ]);
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  // Pre-processing: pad message
  const msgLen = input.length;
  const bitLen = msgLen * 8;
  const padLen = ((56 - ((msgLen + 1) % 64)) + 64) % 64;
  const padded = new Uint8Array(msgLen + 1 + padLen + 8);
  padded.set(input);
  padded[msgLen] = 0x80;
  // Append length in bits as 64-bit LE
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, bitLen >>> 0, true);
  view.setUint32(padded.length - 4, 0, true);

  let a0 = 0x67452301 >>> 0;
  let b0 = 0xefcdab89 >>> 0;
  let c0 = 0x98badcfe >>> 0;
  let d0 = 0x10325476 >>> 0;

  for (let offset = 0; offset < padded.length; offset += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      M[j] = view.getUint32(offset + j * 4, true);
    }

    let A = a0, B = b0, C = c0, D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = ((F >>> 0) + A + K[i]! + M[g]!) >>> 0;
      A = D;
      D = C;
      C = B;
      const rotated = ((F << S[i]!) | (F >>> (32 - S[i]!))) >>> 0;
      B = (B + rotated) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const result = new Uint8Array(16);
  const rv = new DataView(result.buffer);
  rv.setUint32(0, a0, true);
  rv.setUint32(4, b0, true);
  rv.setUint32(8, c0, true);
  rv.setUint32(12, d0, true);
  return result;
}

/**
 * Generates a UUID v3 (MD5 based, deterministic).
 * Same namespace + name always produces the same UUID.
 */
export function generateUuidV3(namespace: string, name: string): string {
  const nsBytes = hexToBytes(namespace);
  const nameBytes = new TextEncoder().encode(name);
  const data = new Uint8Array(nsBytes.length + nameBytes.length);
  data.set(nsBytes);
  data.set(nameBytes, nsBytes.length);

  const hashBytes = md5(data);

  // Set version to 3
  hashBytes[6] = (hashBytes[6]! & 0x0f) | 0x30;
  // Set variant to RFC 4122
  hashBytes[8] = (hashBytes[8]! & 0x3f) | 0x80;

  return bytesToUuid(hashBytes);
}

/**
 * Resolve namespace string to UUID
 */
export function resolveNamespace(ns: UuidNamespace, customUuid?: string): string {
  if (ns === "custom") return customUuid || NIL_UUID;
  return UUID_NAMESPACES[ns];
}

/**
 * Generates a UUID v4 (random)
 */
export function generateUuidV4(): string {
  return crypto.randomUUID();
}

/**
 * Generates a UUID v1-like (time-based)
 */
export function generateUuidV1(): string {
  const now = Date.now();
  const timeHex = now.toString(16).padStart(12, "0");
  const timeLow = timeHex.slice(-8);
  const timeMid = timeHex.slice(-12, -8);
  const timeHiVersion = "1" + timeHex.slice(0, 3);
  const clockSeq = (0x80 | Math.floor(Math.random() * 0x3f)) << 8 | Math.floor(Math.random() * 0xff);
  const clockSeqHex = clockSeq.toString(16).padStart(4, "0");
  const node = Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("");
  return `${timeLow}-${timeMid}-${timeHiVersion}-${clockSeqHex}-${node}`;
}

/**
 * Generates a UUID v7 (Unix Epoch time-based)
 */
export function generateUuidV7(): string {
  const now = Date.now();
  const msHex = now.toString(16).padStart(12, "0");
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  random[0] = 0x70 | ((random[0] ?? 0) & 0x0f);
  random[2] = 0x80 | ((random[2] ?? 0) & 0x3f);
  const randomHex = random.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${msHex.slice(0, 8)}-${msHex.slice(8)}-7${randomHex.slice(1, 4)}-${randomHex.slice(4, 8)}-${randomHex.slice(8, 20)}`;
}

/**
 * Generates a ULID (Universally Unique Lexicographically Sortable Identifier).
 * Format: 26 characters, Crockford's Base32, timestamp + randomness.
 */
export function generateUlid(): string {
  const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const now = Date.now();

  // Encode 48-bit timestamp (10 chars)
  let ts = now;
  const timePart: string[] = [];
  for (let i = 0; i < 10; i++) {
    timePart.unshift(CROCKFORD[ts % 32]!);
    ts = Math.floor(ts / 32);
  }

  // Encode 80 bits of randomness (16 chars)
  const randPart: string[] = [];
  for (let i = 0; i < 16; i++) {
    randPart.push(CROCKFORD[Math.floor(Math.random() * 32)]!);
  }

  return timePart.join("") + randPart.join("");
}

/**
 * Generates a NanoID (URL-friendly unique string identifier).
 * Default alphabet: A-Za-z0-9_- (64 chars), 21 characters long.
 */
export function generateNanoId(size: number = 21): string {
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);

  let id = "";
  for (let i = 0; i < size; i++) {
    id += ALPHABET[(bytes[i] ?? 0) & 63];
  }

  return id;
}

/**
 * Generates a single UUID based on version with optional prefix.
 * v3/v5 are namespace-based and deterministic — they ignore prefix.
 */
export function generateUuid(version: UuidVersion = "v4", prefix: string = ""): string {
  let uuid: string;
  switch (version) {
    case "v1": uuid = generateUuidV1(); break;
    case "v3": uuid = generateUuidV3(UUID_NAMESPACES["dns"], `devflow-${Date.now()}`); break;
    case "v5": uuid = NIL_UUID; break; // v5 is async, handled separately
    case "v7": uuid = generateUuidV7(); break;
    case "nil": uuid = NIL_UUID; break;
    case "max": uuid = MAX_UUID; break;
    case "ulid": return generateUlid();
    case "nanoid": return generateNanoId();
    case "v4":
    default: uuid = generateUuidV4(); break;
  }

  if (prefix && version !== "v3" && version !== "v5") {
    // Replace the first characters with the prefix (hex-safe)
    const cleanPrefix = prefix.replace(/[^a-f0-9]/gi, "").slice(0, 8);
    uuid = cleanPrefix + uuid.slice(cleanPrefix.length);
  }

  return uuid;
}

/**
 * Formats a UUID according to the specified format
 */
export function formatUuid(uuid: string, format: UuidFormat): string {
  const normalized = uuid.toLowerCase().replace(/[^a-f0-9]/g, "");
  const standard = `${normalized.slice(0, 8)}-${normalized.slice(8, 12)}-${normalized.slice(12, 16)}-${normalized.slice(16, 20)}-${normalized.slice(20)}`;

  switch (format) {
    case "uppercase": return standard.toUpperCase();
    case "no-hyphens": return normalized;
    case "braces": return `{${standard}}`;
    case "urn": return `urn:uuid:${standard}`;
    default: return standard;
  }
}

/**
 * Generates multiple UUIDs
 */
export function generateUuids(config: UuidConfig = DEFAULT_UUID_CONFIG): string[] {
  const uuids: string[] = [];
  for (let i = 0; i < Math.min(config.quantity, 1000); i++) {
    const uuid = generateUuid(config.version, config.prefix);
    uuids.push(formatUuid(uuid, config.format));
  }
  return uuids;
}

/**
 * Validates a UUID string
 */
export function validateUuid(input: string): UuidValidation {
  if (!input.trim()) return { isValid: false, error: "Empty input" };
  let normalized = input.trim();
  if (normalized.startsWith("{") && normalized.endsWith("}")) normalized = normalized.slice(1, -1);
  if (normalized.toLowerCase().startsWith("urn:uuid:")) normalized = normalized.slice(9);

  const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
  if (!uuidRegex.test(normalized)) return { isValid: false, error: "Invalid format" };

  const hex = normalized.replace(/-/g, "").toLowerCase();
  if (hex === "0".repeat(32)) return { isValid: true, version: "nil", variant: "nil" };
  if (hex === "f".repeat(32)) return { isValid: true, version: "max", variant: "max" };

  const versionChar = hex[12];
  let version: UuidVersion | "unknown" = "unknown";
  if (versionChar === "1") version = "v1";
  else if (versionChar === "3") version = "v3";
  else if (versionChar === "4") version = "v4";
  else if (versionChar === "5") version = "v5";
  else if (versionChar === "7") version = "v7";

  return { isValid: true, version, variant: "RFC 4122" };
}

/**
 * Parses a UUID and extracts detailed information including binary view
 */
export function parseUuid(input: string): UuidInfo {
  const validation = validateUuid(input);
  if (!validation.isValid) return { uuid: input, version: "unknown", variant: "unknown", isValid: false, isExposed: false, entropyScore: 0 };

  const hex = input.replace(/[^a-f0-9]/gi, "").toLowerCase();
  const binary = hex.split('').map(h => parseInt(h, 16).toString(2).padStart(4, '0')).join('');

  const binaryView: BinaryPart[] = [
    { label: "Time Low", bits: binary.slice(0, 32), color: "text-blue-500" },
    { label: "Time Mid", bits: binary.slice(32, 48), color: "text-indigo-500" },
    { label: "Version", bits: binary.slice(48, 52), color: "text-rose-500" },
    { label: "Time High", bits: binary.slice(52, 64), color: "text-amber-500" },
    { label: "Variant", bits: binary.slice(64, 66), color: "text-emerald-500" },
    { label: "Clock/Node", bits: binary.slice(66), color: "text-purple-500" },
  ];

  const result: UuidInfo = {
    uuid: formatUuid(hex, "standard"),
    version: validation.version || "unknown",
    variant: validation.variant || "RFC 4122",
    isValid: true,
    isExposed: validation.version === "v1" || validation.version === "v7",
    entropyScore: validation.version === "v4" ? 99 : validation.version === "v7" ? 75 : 45,
    binaryView,
  };

  if (validation.version === "v7") {
    result.timestamp = new Date(parseInt(hex.slice(0, 12), 16));
  }

  return result;
}

/**
 * Main processing function with simulated collision stats
 */
export function processUuidGeneration(config: UuidConfig = DEFAULT_UUID_CONFIG): UuidResult {
  const uuids = generateUuids(config);
  return {
    id: crypto.randomUUID(),
    uuids,
    version: config.version,
    format: config.format,
    timestamp: new Date().toISOString(),
    collisionStats: {
      attempts: config.quantity,
      collisions: 0,
      probability: config.version === "v4" ? "< 0.000000000001%" : "0% (time-ordered)"
    }
  };
}

export function formatBulkExport(uuids: string[], format: "text" | "json" | "csv" | "sql"): string {
  switch (format) {
    case "json": return JSON.stringify(uuids, null, 2);
    case "csv": return "uuid\n" + uuids.join("\n");
    case "sql": return "INSERT INTO table_name (uuid_column) VALUES\n" + uuids.map(u => `('${u}')`).join(",\n") + ";";
    default: return uuids.join("\n");
  }
}

export interface CollisionResult {
  total: number;
  unique: number;
  duplicates: [string, number[]][];
}

export function checkCollisions(input: string): CollisionResult | null {
  if (!input.trim()) return null;
  const lines = input.split("\n").map(l => l.trim().toLowerCase()).filter(Boolean);
  const seen = new Map<string, number[]>();
  for (const [i, uuid] of lines.entries()) {
    const existing = seen.get(uuid);
    if (existing) { existing.push(i + 1); } else { seen.set(uuid, [i + 1]); }
  }
  const duplicates = [...seen.entries()].filter(([, indices]) => indices.length > 1);
  return { total: lines.length, unique: seen.size, duplicates };
}
