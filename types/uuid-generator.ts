// UUID Generator Types

export type UuidVersion = "v1" | "v3" | "v4" | "v5" | "v7" | "nil" | "max" | "ulid" | "nanoid";

export type UuidNamespace = "dns" | "url" | "oid" | "x500" | "custom";

export const UUID_NAMESPACES: Record<Exclude<UuidNamespace, "custom">, string> = {
  dns: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  url: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
  oid: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
  x500: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
};
export type UuidFormat = "standard" | "uppercase" | "no-hyphens" | "braces" | "urn" | "base64" | "base58";

export interface UuidConfig {
  version: UuidVersion;
  format: UuidFormat;
  quantity: number;
  prefix: string;
}

export const DEFAULT_UUID_CONFIG: UuidConfig = {
  version: "v4",
  format: "standard",
  quantity: 1,
  prefix: "",
};

export interface UuidResult {
  id: string;
  uuids: string[];
  version: UuidVersion;
  format: UuidFormat;
  timestamp: string;
  collisionStats?: CollisionStats;
}

export interface CollisionStats {
  attempts: number;
  collisions: number;
  probability: string;
}

export interface UuidValidation {
  isValid: boolean;
  version?: UuidVersion | "unknown";
  variant?: string;
  error?: string;
}

export interface BinaryPart {
  label: string;
  bits: string;
  color: string;
}

export interface UuidInfo {
  uuid: string;
  version: UuidVersion | "unknown";
  variant: string;
  isValid: boolean;
  timestamp?: Date;
  clockSeq?: number;
  node?: string;
  isExposed: boolean;
  entropyScore: number;
  binaryView?: BinaryPart[];
}
