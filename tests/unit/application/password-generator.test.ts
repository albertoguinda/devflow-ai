import { describe, it, expect } from "vitest";
import {
  generatePassword,
  evaluateStrength,
  generateBatch,
  processPassword,
  buildCharPool,
  calculatePoolSize,
  formatCrackTime,
  getStrengthLevel,
  getStrengthScore,
} from "@/lib/application/password-generator";
import { DEFAULT_PASSWORD_CONFIG } from "@/types/password-generator";
import type { PasswordConfig } from "@/types/password-generator";

describe("Password Generator", () => {
  describe("generatePassword", () => {
    it("should generate a password with the correct length", () => {
      const config = { ...DEFAULT_PASSWORD_CONFIG, length: 20 };
      const password = generatePassword(config);
      expect(password).toHaveLength(20);
    });

    it("should generate a password with minimum length", () => {
      const config = { ...DEFAULT_PASSWORD_CONFIG, length: 8 };
      const password = generatePassword(config);
      expect(password).toHaveLength(8);
    });

    it("should generate a password with maximum length", () => {
      const config = { ...DEFAULT_PASSWORD_CONFIG, length: 128 };
      const password = generatePassword(config);
      expect(password).toHaveLength(128);
    });

    it("should clamp length to 256 maximum", () => {
      const config = { ...DEFAULT_PASSWORD_CONFIG, length: 300 };
      const password = generatePassword(config);
      expect(password).toHaveLength(256);
    });

    it("should only use uppercase characters when only uppercase is selected", () => {
      const config: PasswordConfig = {
        length: 50,
        uppercase: true,
        lowercase: false,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      };
      const password = generatePassword(config);
      expect(password).toMatch(/^[A-Z]+$/);
    });

    it("should only use lowercase characters when only lowercase is selected", () => {
      const config: PasswordConfig = {
        length: 50,
        uppercase: false,
        lowercase: true,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      };
      const password = generatePassword(config);
      expect(password).toMatch(/^[a-z]+$/);
    });

    it("should only use digits when only numbers is selected", () => {
      const config: PasswordConfig = {
        length: 50,
        uppercase: false,
        lowercase: false,
        numbers: true,
        symbols: false,
        excludeAmbiguous: false,
      };
      const password = generatePassword(config);
      expect(password).toMatch(/^[0-9]+$/);
    });

    it("should only use symbol characters when only symbols is selected", () => {
      const config: PasswordConfig = {
        length: 50,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: true,
        excludeAmbiguous: false,
      };
      const password = generatePassword(config);
      expect(password).toMatch(/^[^A-Za-z0-9]+$/);
    });

    it("should exclude ambiguous characters when excludeAmbiguous is true", () => {
      const config: PasswordConfig = {
        length: 200,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: true,
      };
      const password = generatePassword(config);
      const ambiguous = "0OoIl1|";
      for (const char of ambiguous) {
        expect(password).not.toContain(char);
      }
    });

    it("should throw when no character pools are selected", () => {
      const config: PasswordConfig = {
        length: 16,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      };
      expect(() => generatePassword(config)).toThrow("At least one character pool must be selected");
    });

    it("should generate unique passwords each time", () => {
      const passwords = new Set<string>();
      for (let i = 0; i < 20; i++) {
        passwords.add(generatePassword(DEFAULT_PASSWORD_CONFIG));
      }
      // With 16 chars from a 95-char pool, collision is astronomically unlikely
      expect(passwords.size).toBe(20);
    });

    it("should handle length of 1", () => {
      const config = { ...DEFAULT_PASSWORD_CONFIG, length: 1 };
      const password = generatePassword(config);
      expect(password).toHaveLength(1);
    });
  });

  describe("buildCharPool", () => {
    it("should build a pool with all character types", () => {
      const pool = buildCharPool(DEFAULT_PASSWORD_CONFIG);
      expect(pool).toContain("A");
      expect(pool).toContain("a");
      expect(pool).toContain("0");
      expect(pool).toContain("!");
    });

    it("should exclude ambiguous characters when requested", () => {
      const config = { ...DEFAULT_PASSWORD_CONFIG, excludeAmbiguous: true };
      const pool = buildCharPool(config);
      expect(pool).not.toContain("O");
      expect(pool).not.toContain("0");
      expect(pool).not.toContain("I");
      expect(pool).not.toContain("l");
      expect(pool).not.toContain("1");
      expect(pool).not.toContain("|");
    });

    it("should throw for empty pool", () => {
      const config: PasswordConfig = {
        length: 16,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      };
      expect(() => buildCharPool(config)).toThrow();
    });
  });

  describe("evaluateStrength", () => {
    it("should return very-weak for short numeric-only passwords", () => {
      const result = evaluateStrength("1234");
      expect(result.level).toBe("very-weak");
      expect(result.score).toBeLessThan(20);
    });

    it("should return very-strong for long mixed passwords", () => {
      const result = evaluateStrength("aB3!cD4@eF5#gH6$iJ7%kL8^mN9&oP0*qR1(sT2)uV");
      expect(result.level).toBe("very-strong");
      expect(result.score).toBeGreaterThanOrEqual(90);
    });

    it("should return instant crack time for empty password", () => {
      const result = evaluateStrength("");
      expect(result.crackTime).toBe("instant");
      expect(result.entropy).toBe(0);
      expect(result.score).toBe(0);
    });

    it("should calculate entropy correctly for lowercase only", () => {
      // 8 lowercase chars: entropy = 8 * log2(26) ≈ 37.6
      const result = evaluateStrength("abcdefgh");
      expect(result.entropy).toBeGreaterThan(37);
      expect(result.entropy).toBeLessThan(38);
    });

    it("should calculate higher entropy for mixed character types", () => {
      const lowercaseOnly = evaluateStrength("abcdefgh");
      const mixed = evaluateStrength("aBc1!@#d");
      expect(mixed.entropy).toBeGreaterThan(lowercaseOnly.entropy);
    });

    it("should map strength levels according to entropy thresholds", () => {
      // < 28 bits → very-weak
      expect(evaluateStrength("abc").level).toBe("very-weak");
      // >= 128 bits → very-strong
      const longPw = "aB1!aB1!aB1!aB1!aB1!aB1!"; // 24 chars, ~157 bits
      expect(evaluateStrength(longPw).level).toBe("very-strong");
    });
  });

  describe("getStrengthLevel", () => {
    it("should return very-weak for entropy < 28", () => {
      expect(getStrengthLevel(0)).toBe("very-weak");
      expect(getStrengthLevel(27)).toBe("very-weak");
    });

    it("should return weak for entropy 28-35", () => {
      expect(getStrengthLevel(28)).toBe("weak");
      expect(getStrengthLevel(35)).toBe("weak");
    });

    it("should return fair for entropy 36-59", () => {
      expect(getStrengthLevel(36)).toBe("fair");
      expect(getStrengthLevel(59)).toBe("fair");
    });

    it("should return strong for entropy 60-127", () => {
      expect(getStrengthLevel(60)).toBe("strong");
      expect(getStrengthLevel(127)).toBe("strong");
    });

    it("should return very-strong for entropy >= 128", () => {
      expect(getStrengthLevel(128)).toBe("very-strong");
      expect(getStrengthLevel(256)).toBe("very-strong");
    });
  });

  describe("getStrengthScore", () => {
    it("should return 0 for zero entropy", () => {
      expect(getStrengthScore(0)).toBe(0);
    });

    it("should return score <= 20 for entropy < 28", () => {
      expect(getStrengthScore(14)).toBeLessThanOrEqual(20);
    });

    it("should return score >= 90 for entropy >= 128", () => {
      expect(getStrengthScore(128)).toBeGreaterThanOrEqual(90);
    });

    it("should return 100 for entropy = 256", () => {
      expect(getStrengthScore(256)).toBe(100);
    });

    it("should increase monotonically", () => {
      let prev = getStrengthScore(0);
      for (let entropy = 10; entropy <= 256; entropy += 10) {
        const current = getStrengthScore(entropy);
        expect(current).toBeGreaterThanOrEqual(prev);
        prev = current;
      }
    });
  });

  describe("calculatePoolSize", () => {
    it("should detect uppercase only", () => {
      expect(calculatePoolSize("ABC")).toBe(26);
    });

    it("should detect lowercase only", () => {
      expect(calculatePoolSize("abc")).toBe(26);
    });

    it("should detect mixed case", () => {
      expect(calculatePoolSize("aBc")).toBe(52);
    });

    it("should detect mixed case + digits", () => {
      expect(calculatePoolSize("aB1")).toBe(62);
    });

    it("should detect all character types", () => {
      expect(calculatePoolSize("aB1!")).toBe(95);
    });

    it("should return at least 1 for empty string", () => {
      expect(calculatePoolSize("")).toBe(1);
    });
  });

  describe("formatCrackTime", () => {
    it("should return instant for very small values", () => {
      expect(formatCrackTime(0.0001)).toBe("instant");
    });

    it("should return < 1 second for sub-second values", () => {
      expect(formatCrackTime(0.5)).toBe("< 1 second");
    });

    it("should format seconds", () => {
      expect(formatCrackTime(30)).toBe("30 seconds");
    });

    it("should format minutes", () => {
      expect(formatCrackTime(300)).toBe("5 minutes");
    });

    it("should format hours", () => {
      expect(formatCrackTime(7200)).toBe("2 hours");
    });

    it("should format days", () => {
      expect(formatCrackTime(86400 * 5)).toBe("5 days");
    });

    it("should format years", () => {
      expect(formatCrackTime(86400 * 365 * 10)).toBe("10 years");
    });

    it("should format thousands of years", () => {
      expect(formatCrackTime(86400 * 365 * 5000)).toBe("5.0k years");
    });

    it("should format millions of years", () => {
      expect(formatCrackTime(86400 * 365 * 2e6)).toBe("2.0M years");
    });

    it("should format billions of years", () => {
      expect(formatCrackTime(86400 * 365 * 3e9)).toBe("3.0B years");
    });

    it("should format trillions of years", () => {
      expect(formatCrackTime(86400 * 365 * 1.5e12)).toBe("1.5T years");
    });

    it("should return centuries+ for astronomically large values", () => {
      expect(formatCrackTime(86400 * 365 * 1e18)).toBe("centuries+");
    });
  });

  describe("generateBatch", () => {
    it("should generate the requested number of passwords", () => {
      const batch = generateBatch(DEFAULT_PASSWORD_CONFIG, 5);
      expect(batch).toHaveLength(5);
    });

    it("should generate all unique passwords", () => {
      const batch = generateBatch(DEFAULT_PASSWORD_CONFIG, 10);
      const uniqueSet = new Set(batch);
      expect(uniqueSet.size).toBe(10);
    });

    it("should respect max limit of 100", () => {
      const batch = generateBatch(DEFAULT_PASSWORD_CONFIG, 200);
      expect(batch).toHaveLength(100);
    });

    it("should generate at least 1 even when count is 0", () => {
      const batch = generateBatch(DEFAULT_PASSWORD_CONFIG, 0);
      expect(batch).toHaveLength(1);
    });

    it("should use the provided config for each password", () => {
      const config: PasswordConfig = {
        length: 10,
        uppercase: false,
        lowercase: true,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      };
      const batch = generateBatch(config, 5);
      for (const pw of batch) {
        expect(pw).toHaveLength(10);
        expect(pw).toMatch(/^[a-z]+$/);
      }
    });
  });

  describe("processPassword", () => {
    it("should return a valid PasswordResult", () => {
      const result = processPassword(DEFAULT_PASSWORD_CONFIG);
      expect(result.id).toBeTruthy();
      expect(result.password).toHaveLength(DEFAULT_PASSWORD_CONFIG.length);
      expect(result.strength).toBeDefined();
      expect(result.strength.level).toBeTruthy();
      expect(result.strength.entropy).toBeGreaterThan(0);
      expect(result.config).toEqual(DEFAULT_PASSWORD_CONFIG);
      expect(result.timestamp).toBeTruthy();
    });

    it("should generate unique IDs for each result", () => {
      const r1 = processPassword(DEFAULT_PASSWORD_CONFIG);
      const r2 = processPassword(DEFAULT_PASSWORD_CONFIG);
      expect(r1.id).not.toBe(r2.id);
    });

    it("should produce different passwords for each call", () => {
      const r1 = processPassword(DEFAULT_PASSWORD_CONFIG);
      const r2 = processPassword(DEFAULT_PASSWORD_CONFIG);
      expect(r1.password).not.toBe(r2.password);
    });

    it("should include strength evaluation consistent with the generated password", () => {
      const result = processPassword(DEFAULT_PASSWORD_CONFIG);
      const manualStrength = evaluateStrength(result.password);
      expect(result.strength.entropy).toBe(manualStrength.entropy);
      expect(result.strength.level).toBe(manualStrength.level);
    });

    it("should copy the config (not reference)", () => {
      const config = { ...DEFAULT_PASSWORD_CONFIG };
      const result = processPassword(config);
      config.length = 999;
      expect(result.config.length).toBe(DEFAULT_PASSWORD_CONFIG.length);
    });
  });
});
