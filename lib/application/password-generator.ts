// Password Generator Application Logic

import type {
  PasswordConfig,
  PasswordResult,
  PasswordStrength,
  PasswordStrengthLevel,
} from "@/types/password-generator";

// Character pools
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

// Characters considered ambiguous
const AMBIGUOUS = "0OoIl1|";

/**
 * Builds the character pool based on config options.
 * Throws if no character pools are selected.
 */
export function buildCharPool(config: PasswordConfig): string {
  let pool = "";

  if (config.uppercase) pool += UPPERCASE;
  if (config.lowercase) pool += LOWERCASE;
  if (config.numbers) pool += NUMBERS;
  if (config.symbols) pool += SYMBOLS;

  if (pool.length === 0) {
    throw new Error("At least one character pool must be selected");
  }

  if (config.excludeAmbiguous) {
    pool = pool
      .split("")
      .filter((c) => !AMBIGUOUS.includes(c))
      .join("");
  }

  if (pool.length === 0) {
    throw new Error("No characters available after excluding ambiguous characters");
  }

  return pool;
}

/**
 * Generates a cryptographically random password using crypto.getRandomValues().
 * Uses rejection sampling to avoid modulo bias.
 */
export function generatePassword(config: PasswordConfig): string {
  const pool = buildCharPool(config);
  const poolSize = pool.length;

  // Find the largest multiple of poolSize that fits in a byte (256)
  // to avoid modulo bias
  const maxValid = Math.floor(256 / poolSize) * poolSize;

  const length = Math.max(1, Math.min(config.length, 256));
  const result: string[] = [];

  while (result.length < length) {
    // Generate enough random bytes to likely fill the remainder
    const needed = length - result.length;
    const buffer = new Uint8Array(needed * 2);
    crypto.getRandomValues(buffer);

    for (let i = 0; i < buffer.length && result.length < length; i++) {
      const byte = buffer[i]!;
      // Reject bytes that would cause modulo bias
      if (byte < maxValid) {
        const charIndex = byte % poolSize;
        const char = pool[charIndex];
        if (char !== undefined) {
          result.push(char);
        }
      }
    }
  }

  return result.join("");
}

/**
 * Calculates the size of the character pool for a given password.
 * Analyzes actual characters used to determine the effective pool size.
 */
export function calculatePoolSize(password: string): number {
  let poolSize = 0;
  let hasUpper = false;
  let hasLower = false;
  let hasDigit = false;
  let hasSymbol = false;

  for (const char of password) {
    if (!hasUpper && /[A-Z]/.test(char)) {
      hasUpper = true;
      poolSize += 26;
    } else if (!hasLower && /[a-z]/.test(char)) {
      hasLower = true;
      poolSize += 26;
    } else if (!hasDigit && /[0-9]/.test(char)) {
      hasDigit = true;
      poolSize += 10;
    } else if (!hasSymbol && /[^A-Za-z0-9]/.test(char)) {
      hasSymbol = true;
      poolSize += 33; // Approximate printable symbol count
    }
  }

  return Math.max(poolSize, 1);
}

/**
 * Formats seconds into a human-readable crack time string.
 */
export function formatCrackTime(seconds: number): string {
  if (seconds < 0.001) return "instant";
  if (seconds < 1) return "< 1 second";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;

  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.round(minutes)} minutes`;

  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)} hours`;

  const days = hours / 24;
  if (days < 365) return `${Math.round(days)} days`;

  const years = days / 365;
  if (years < 1000) return `${Math.round(years)} years`;
  if (years < 1e6) return `${(years / 1000).toFixed(1)}k years`;
  if (years < 1e9) return `${(years / 1e6).toFixed(1)}M years`;
  if (years < 1e12) return `${(years / 1e9).toFixed(1)}B years`;
  if (years < 1e15) return `${(years / 1e12).toFixed(1)}T years`;

  return "centuries+";
}

/**
 * Maps entropy bits to a strength level.
 */
export function getStrengthLevel(entropy: number): PasswordStrengthLevel {
  if (entropy < 28) return "very-weak";
  if (entropy < 36) return "weak";
  if (entropy < 60) return "fair";
  if (entropy < 128) return "strong";
  return "very-strong";
}

/**
 * Maps strength level to a numeric score (0-100).
 */
export function getStrengthScore(entropy: number): number {
  if (entropy <= 0) return 0;
  // Cap at 256 bits for scoring purposes
  const capped = Math.min(entropy, 256);
  // Non-linear scaling: emphasize the 28-128 range
  if (capped < 28) return Math.round((capped / 28) * 20);
  if (capped < 36) return 20 + Math.round(((capped - 28) / (36 - 28)) * 15);
  if (capped < 60) return 35 + Math.round(((capped - 36) / (60 - 36)) * 25);
  if (capped < 128) return 60 + Math.round(((capped - 60) / (128 - 60)) * 30);
  return 90 + Math.round(((capped - 128) / (256 - 128)) * 10);
}

/**
 * Evaluates the strength of a password.
 * Calculates entropy as log2(poolSize ^ length) = length * log2(poolSize).
 * Estimates crack time assuming 10 billion guesses per second.
 */
export function evaluateStrength(password: string): PasswordStrength {
  if (password.length === 0) {
    return {
      score: 0,
      level: "very-weak",
      entropy: 0,
      crackTime: "instant",
    };
  }

  const poolSize = calculatePoolSize(password);
  const entropy = password.length * Math.log2(poolSize);

  // Assume 10 billion (10^10) guesses per second
  const GUESSES_PER_SECOND = 1e10;
  // Total combinations = poolSize ^ length = 2^entropy
  // Time to crack = 2^entropy / (2 * guessesPerSecond) [average case = half the space]
  const totalCombinations = Math.pow(2, entropy);
  const crackTimeSeconds = totalCombinations / (2 * GUESSES_PER_SECOND);

  return {
    score: getStrengthScore(entropy),
    level: getStrengthLevel(entropy),
    entropy: Math.round(entropy * 100) / 100,
    crackTime: formatCrackTime(crackTimeSeconds),
  };
}

/**
 * Generates a batch of passwords with the same config.
 */
export function generateBatch(config: PasswordConfig, count: number): string[] {
  const safeCount = Math.max(1, Math.min(count, 100));
  const passwords: string[] = [];

  for (let i = 0; i < safeCount; i++) {
    passwords.push(generatePassword(config));
  }

  return passwords;
}

/**
 * Processes a password generation request and returns a full result.
 */
export function processPassword(config: PasswordConfig): PasswordResult {
  const password = generatePassword(config);
  const strength = evaluateStrength(password);

  return {
    id: crypto.randomUUID(),
    password,
    strength,
    config: { ...config },
    timestamp: new Date().toISOString(),
  };
}
