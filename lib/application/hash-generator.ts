// Hash Generator Application Logic
// Uses native Web Crypto API (SHA-1/256/384/512) + pure JS MD5 fallback

import type {
  HashAlgorithm,
  HashOutputFormat,
  HashConfig,
  HashResult,
  HmacConfig,
  HashDetection,
} from "@/types/hash-generator";
import { DEFAULT_HASH_CONFIG, HASH_LENGTHS, WEBCRYPTO_ALGORITHM } from "@/types/hash-generator";

// ─── MD5 Implementation (pure JS, Web Crypto doesn't support MD5) ───

function md5(input: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);

  function leftRotate(x: number, c: number): number {
    return (x << c) | (x >>> (32 - c));
  }

  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  const K = Array.from({ length: 64 }, (_, i) =>
    Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000)
  );

  // Pre-processing: pad message
  const bitLen = bytes.length * 8;
  const padded = new Uint8Array(
    bytes.length + 1 + ((55 - bytes.length % 64 + 64) % 64) + 8
  );
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, bitLen & 0xffffffff, true);
  view.setUint32(padded.length - 4, Math.floor(bitLen / 0x100000000), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let offset = 0; offset < padded.length; offset += 64) {
    const M = Array.from({ length: 16 }, (_, j) =>
      view.getUint32(offset + j * 4, true)
    );

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

      const mG = M[g];
      const kI = K[i];
      const sI = s[i];
      if (mG === undefined || kI === undefined || sI === undefined) continue;

      F = (F + A + kI + mG) | 0;
      A = D;
      D = C;
      C = B;
      B = (B + leftRotate(F, sI)) | 0;
    }

    a0 = (a0 + A) | 0;
    b0 = (b0 + B) | 0;
    c0 = (c0 + C) | 0;
    d0 = (d0 + D) | 0;
  }

  function toHex(n: number): string {
    return Array.from({ length: 4 }, (_, i) =>
      ((n >>> (i * 8)) & 0xff).toString(16).padStart(2, "0")
    ).join("");
  }

  return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0);
}

// ─── Core Functions ───

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...Array.from(bytes.slice(i, i + chunkSize)));
  }
  return btoa(binary);
}

function formatOutput(buffer: ArrayBuffer, format: HashOutputFormat): string {
  switch (format) {
    case "hex":
      return bufferToHex(buffer);
    case "uppercase-hex":
      return bufferToHex(buffer).toUpperCase();
    case "base64":
      return bufferToBase64(buffer);
  }
}

/**
 * Generate a hash of the input string using the specified algorithm.
 * Uses Web Crypto API for SHA variants, pure JS for MD5.
 */
export async function generateHash(
  input: string,
  config: HashConfig = DEFAULT_HASH_CONFIG
): Promise<string> {
  if (!input) return "";

  if (config.algorithm === "md5") {
    const hex = md5(input);
    if (config.outputFormat === "uppercase-hex") return hex.toUpperCase();
    if (config.outputFormat === "base64") {
      const bytes = new Uint8Array(
        (hex.match(/.{2}/g) ?? []).map((b) => parseInt(b, 16))
      );
      return bufferToBase64(bytes.buffer as ArrayBuffer);
    }
    return hex;
  }

  const algorithmName = WEBCRYPTO_ALGORITHM[config.algorithm];
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const buffer = await crypto.subtle.digest(algorithmName, data);
  return formatOutput(buffer, config.outputFormat);
}

/**
 * Generate an HMAC of the input string using the specified algorithm and key.
 */
export async function generateHmac(
  input: string,
  hmacConfig: HmacConfig
): Promise<string> {
  if (!input || !hmacConfig.key) return "";

  if (hmacConfig.algorithm === "md5") {
    // HMAC-MD5: use manual implementation
    const blockSize = 64;
    const encoder = new TextEncoder();
    let keyBytes = encoder.encode(hmacConfig.key);

    if (keyBytes.length > blockSize) {
      const hex = md5(hmacConfig.key);
      keyBytes = new Uint8Array(
        (hex.match(/.{2}/g) ?? []).map((b) => parseInt(b, 16))
      );
    }

    const paddedKey = new Uint8Array(blockSize);
    paddedKey.set(keyBytes);

    const oKeyPad = new Uint8Array(blockSize);
    const iKeyPad = new Uint8Array(blockSize);
    for (let i = 0; i < blockSize; i++) {
      oKeyPad[i] = (paddedKey[i] ?? 0) ^ 0x5c;
      iKeyPad[i] = (paddedKey[i] ?? 0) ^ 0x36;
    }

    const innerData = new Uint8Array(blockSize + encoder.encode(input).length);
    innerData.set(iKeyPad);
    innerData.set(encoder.encode(input), blockSize);
    const innerHash = md5(new TextDecoder().decode(innerData));

    const outerData = new Uint8Array(blockSize + 16);
    outerData.set(oKeyPad);
    outerData.set(
      new Uint8Array((innerHash.match(/.{2}/g) ?? []).map((b) => parseInt(b, 16))),
      blockSize
    );
    return md5(new TextDecoder().decode(outerData));
  }

  const algorithmName = WEBCRYPTO_ALGORITHM[hmacConfig.algorithm];
  const encoder = new TextEncoder();
  const keyData = encoder.encode(hmacConfig.key);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: algorithmName },
    false,
    ["sign"]
  );
  const data = encoder.encode(input);
  const buffer = await crypto.subtle.sign("HMAC", cryptoKey, data);
  return formatOutput(buffer, hmacConfig.outputFormat);
}

/**
 * Generate a hash for a file (ArrayBuffer).
 */
export async function generateFileHash(
  file: ArrayBuffer,
  algorithm: HashAlgorithm,
  outputFormat: HashOutputFormat = "hex"
): Promise<string> {
  if (algorithm === "md5") {
    // Convert buffer to string for MD5
    const bytes = new Uint8Array(file);
    let str = "";
    for (let i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i] ?? 0);
    }
    const hex = md5(str);
    if (outputFormat === "uppercase-hex") return hex.toUpperCase();
    return hex;
  }

  const algorithmName = WEBCRYPTO_ALGORITHM[algorithm];
  const buffer = await crypto.subtle.digest(algorithmName, file);
  return formatOutput(buffer, outputFormat);
}

/**
 * Detect possible hash algorithms based on the string length and format.
 */
export function detectHashType(hash: string): HashDetection {
  const trimmed = hash.trim();
  const isHex = /^[0-9a-f]+$/i.test(trimmed);
  const length = trimmed.length;

  const possibleAlgorithms: HashAlgorithm[] = [];

  if (isHex) {
    for (const [algo, expectedLen] of Object.entries(HASH_LENGTHS)) {
      if (length === expectedLen) {
        possibleAlgorithms.push(algo as HashAlgorithm);
      }
    }
  }

  return { possibleAlgorithms, length, isHex };
}

/**
 * Compare two hash strings in constant time to prevent timing attacks.
 */
export function compareHashes(a: string, b: string): boolean {
  const aNorm = a.trim().toLowerCase();
  const bNorm = b.trim().toLowerCase();

  if (aNorm.length !== bNorm.length) return false;

  let diff = 0;
  for (let i = 0; i < aNorm.length; i++) {
    diff |= (aNorm.charCodeAt(i)) ^ (bNorm.charCodeAt(i));
  }
  return diff === 0;
}

/**
 * Generate hashes for all supported algorithms at once.
 */
export async function generateAllHashes(
  input: string,
  outputFormat: HashOutputFormat = "hex"
): Promise<Record<HashAlgorithm, string>> {
  const algorithms: HashAlgorithm[] = ["md5", "sha1", "sha256", "sha384", "sha512"];
  const results = await Promise.all(
    algorithms.map((algo) => generateHash(input, { algorithm: algo, outputFormat }))
  );

  return Object.fromEntries(
    algorithms.map((algo, i) => [algo, results[i] ?? ""])
  ) as Record<HashAlgorithm, string>;
}

/**
 * Process hash generation and return a full result object.
 */
export async function processHash(
  input: string,
  config: HashConfig = DEFAULT_HASH_CONFIG
): Promise<HashResult> {
  const hash = await generateHash(input, config);
  return {
    id: crypto.randomUUID(),
    input,
    hash,
    algorithm: config.algorithm,
    outputFormat: config.outputFormat,
    timestamp: new Date().toISOString(),
  };
}
