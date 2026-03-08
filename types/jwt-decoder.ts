// JWT Decoder Types

export interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  raw: {
    header: string;
    payload: string;
    signature: string;
  };
}

export interface JwtValidation {
  isValid: boolean;
  isExpired: boolean;
  isNotYetValid: boolean;
  expiresAt: string | null;
  issuedAt: string | null;
  notBefore: string | null;
  algorithm: string | null;
  issuer: string | null;
  subject: string | null;
  audience: string | string[] | null;
  errors: string[];
}

export interface JwtClaim {
  key: string;
  value: unknown;
  label: string;
  description: string;
  type: "standard" | "custom";
  status?: "ok" | "warning" | "error";
}

export interface JwtResult {
  id: string;
  token: string;
  parts: JwtParts;
  validation: JwtValidation;
  claims: JwtClaim[];
  timestamp: string;
}

/** Standard JWT claim descriptions (used for annotation) */
export const STANDARD_CLAIMS: Record<string, { label: string; descriptionKey: string }> = {
  iss: { label: "Issuer", descriptionKey: "jwt.claim.iss" },
  sub: { label: "Subject", descriptionKey: "jwt.claim.sub" },
  aud: { label: "Audience", descriptionKey: "jwt.claim.aud" },
  exp: { label: "Expiration", descriptionKey: "jwt.claim.exp" },
  nbf: { label: "Not Before", descriptionKey: "jwt.claim.nbf" },
  iat: { label: "Issued At", descriptionKey: "jwt.claim.iat" },
  jti: { label: "JWT ID", descriptionKey: "jwt.claim.jti" },
};
