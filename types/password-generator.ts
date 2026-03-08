// Password Generator Types

export interface PasswordConfig {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export const DEFAULT_PASSWORD_CONFIG: PasswordConfig = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
};

export type PasswordStrengthLevel =
  | "very-weak"
  | "weak"
  | "fair"
  | "strong"
  | "very-strong";

export interface PasswordStrength {
  score: number;
  level: PasswordStrengthLevel;
  entropy: number;
  crackTime: string;
}

export interface PasswordResult {
  id: string;
  password: string;
  strength: PasswordStrength;
  config: PasswordConfig;
  timestamp: string;
}
