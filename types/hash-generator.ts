// Hash Generator Types

export type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha384" | "sha512";

export type HashOutputFormat = "hex" | "base64" | "uppercase-hex";

export interface HashConfig {
  algorithm: HashAlgorithm;
  outputFormat: HashOutputFormat;
}

export const DEFAULT_HASH_CONFIG: HashConfig = {
  algorithm: "sha256",
  outputFormat: "hex",
};

export interface HashResult {
  id: string;
  input: string;
  hash: string;
  algorithm: HashAlgorithm;
  outputFormat: HashOutputFormat;
  timestamp: string;
}

export interface HmacConfig {
  algorithm: HashAlgorithm;
  key: string;
  outputFormat: HashOutputFormat;
}

export interface HashDetection {
  possibleAlgorithms: HashAlgorithm[];
  length: number;
  isHex: boolean;
}

export const HASH_LENGTHS: Record<HashAlgorithm, number> = {
  md5: 32,
  sha1: 40,
  sha256: 64,
  sha384: 96,
  sha512: 128,
};

export const HASH_ALGORITHM_LABELS: Record<HashAlgorithm, string> = {
  md5: "MD5",
  sha1: "SHA-1",
  sha256: "SHA-256",
  sha384: "SHA-384",
  sha512: "SHA-512",
};

/** Web Crypto API algorithm names */
export const WEBCRYPTO_ALGORITHM: Record<Exclude<HashAlgorithm, "md5">, string> = {
  sha1: "SHA-1",
  sha256: "SHA-256",
  sha384: "SHA-384",
  sha512: "SHA-512",
};
