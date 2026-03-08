import { describe, it, expect } from "vitest";
import {
  parseColor,
  convertColor,
  convertToAllFormats,
  calculateContrast,
  relativeLuminance,
  getWcagLevel,
  checkContrast,
  generatePalette,
  processColorConversion,
} from "@/lib/application/color-converter";
import type { ColorValue } from "@/types/color-converter";

// ─── Helpers ────────────────────────────────────────────────────────────────

const BLACK: ColorValue = { r: 0, g: 0, b: 0, a: 1 };
const WHITE: ColorValue = { r: 1, g: 1, b: 1, a: 1 };
const RED: ColorValue = { r: 1, g: 0, b: 0, a: 1 };
const BLUE: ColorValue = { r: 0, g: 0, b: 1, a: 1 };

function expectClose(actual: number, expected: number, tolerance = 0.01): void {
  expect(Math.abs(actual - expected)).toBeLessThan(tolerance);
}

// ─── parseColor ─────────────────────────────────────────────────────────────

describe("parseColor", () => {
  it("should parse 3-digit hex (#f00)", () => {
    const c = parseColor("#f00");
    expect(c).not.toBeNull();
    expect(c!.r).toBe(1);
    expect(c!.g).toBe(0);
    expect(c!.b).toBe(0);
    expect(c!.a).toBe(1);
  });

  it("should parse 6-digit hex (#ff0000)", () => {
    const c = parseColor("#ff0000");
    expect(c).not.toBeNull();
    expect(c!.r).toBe(1);
    expect(c!.g).toBe(0);
    expect(c!.b).toBe(0);
  });

  it("should parse 8-digit hex with alpha (#ff000080)", () => {
    const c = parseColor("#ff000080");
    expect(c).not.toBeNull();
    expect(c!.r).toBe(1);
    expect(c!.g).toBe(0);
    expect(c!.b).toBe(0);
    expectClose(c!.a, 128 / 255, 0.005);
  });

  it("should parse 4-digit hex with alpha (#f00f)", () => {
    const c = parseColor("#f00f");
    expect(c).not.toBeNull();
    expect(c!.r).toBe(1);
    expect(c!.g).toBe(0);
    expect(c!.b).toBe(0);
    expect(c!.a).toBe(1);
  });

  it("should parse rgb(255, 0, 0)", () => {
    const c = parseColor("rgb(255, 0, 0)");
    expect(c).not.toBeNull();
    expect(c!.r).toBe(1);
    expect(c!.g).toBe(0);
    expect(c!.b).toBe(0);
    expect(c!.a).toBe(1);
  });

  it("should parse rgba(128, 64, 32, 0.5)", () => {
    const c = parseColor("rgba(128, 64, 32, 0.5)");
    expect(c).not.toBeNull();
    expectClose(c!.r, 128 / 255, 0.005);
    expectClose(c!.g, 64 / 255, 0.005);
    expectClose(c!.b, 32 / 255, 0.005);
    expect(c!.a).toBe(0.5);
  });

  it("should parse hsl(0, 100%, 50%)", () => {
    const c = parseColor("hsl(0, 100%, 50%)");
    expect(c).not.toBeNull();
    expectClose(c!.r, 1, 0.01);
    expectClose(c!.g, 0, 0.01);
    expectClose(c!.b, 0, 0.01);
  });

  it("should parse hsl achromatic (0% saturation)", () => {
    const c = parseColor("hsl(0, 0%, 50%)");
    expect(c).not.toBeNull();
    expectClose(c!.r, 0.5, 0.01);
    expectClose(c!.g, 0.5, 0.01);
    expectClose(c!.b, 0.5, 0.01);
  });

  it("should parse oklch(0.7 0.15 180)", () => {
    const c = parseColor("oklch(0.7 0.15 180)");
    expect(c).not.toBeNull();
    // oklch values produce specific RGB — just check ranges
    expect(c!.r).toBeGreaterThanOrEqual(0);
    expect(c!.r).toBeLessThanOrEqual(1);
    expect(c!.g).toBeGreaterThanOrEqual(0);
    expect(c!.b).toBeGreaterThanOrEqual(0);
  });

  it("should parse hwb(0 0% 0%)", () => {
    const c = parseColor("hwb(0 0% 0%)");
    expect(c).not.toBeNull();
    expectClose(c!.r, 1, 0.01);
    expectClose(c!.g, 0, 0.01);
    expectClose(c!.b, 0, 0.01);
  });

  it("should parse hwb with whiteness and blackness", () => {
    const c = parseColor("hwb(0 50% 50%)");
    expect(c).not.toBeNull();
    // 50% white + 50% black = gray
    expectClose(c!.r, 0.5, 0.01);
    expectClose(c!.g, 0.5, 0.01);
    expectClose(c!.b, 0.5, 0.01);
  });

  it("should return null for invalid input", () => {
    expect(parseColor("not a color")).toBeNull();
    expect(parseColor("")).toBeNull();
    expect(parseColor("#gg0000")).toBeNull();
    expect(parseColor("rgb(999, 0, 0)")).toBeNull();
  });

  it("should handle case-insensitive hex", () => {
    const lower = parseColor("#aabbcc");
    const upper = parseColor("#AABBCC");
    expect(lower).not.toBeNull();
    expect(upper).not.toBeNull();
    expect(lower!.r).toBe(upper!.r);
    expect(lower!.g).toBe(upper!.g);
    expect(lower!.b).toBe(upper!.b);
  });

  it("should trim whitespace", () => {
    const c = parseColor("  #ff0000  ");
    expect(c).not.toBeNull();
    expect(c!.r).toBe(1);
  });
});

// ─── convertColor ───────────────────────────────────────────────────────────

describe("convertColor", () => {
  it("should convert to hex", () => {
    expect(convertColor(RED, "hex")).toBe("#ff0000");
  });

  it("should convert to hex with alpha", () => {
    const c = { ...RED, a: 0.5 };
    const hex = convertColor(c, "hex");
    expect(hex).toMatch(/^#ff0000[0-9a-f]{2}$/);
  });

  it("should convert to rgb", () => {
    expect(convertColor(RED, "rgb")).toBe("rgb(255, 0, 0)");
  });

  it("should convert to rgba when alpha < 1", () => {
    const result = convertColor({ r: 1, g: 0, b: 0, a: 0.5 }, "rgb");
    expect(result).toBe("rgba(255, 0, 0, 0.5)");
  });

  it("should convert to hsl", () => {
    const hsl = convertColor(RED, "hsl");
    expect(hsl).toBe("hsl(0, 100%, 50%)");
  });

  it("should convert hex to hsl round-trip", () => {
    const original = parseColor("#3498db");
    expect(original).not.toBeNull();
    const hsl = convertColor(original!, "hsl");
    const reparsed = parseColor(hsl);
    expect(reparsed).not.toBeNull();
    expectClose(reparsed!.r, original!.r, 0.02);
    expectClose(reparsed!.g, original!.g, 0.02);
    expectClose(reparsed!.b, original!.b, 0.02);
  });

  it("should convert to oklch format", () => {
    const oklch = convertColor(RED, "oklch");
    expect(oklch).toMatch(/^oklch\([0-9.]+ [0-9.]+ [0-9.]+\)$/);
  });

  it("should convert to hwb format", () => {
    const hwb = convertColor(RED, "hwb");
    expect(hwb).toMatch(/^hwb\(\d+ \d+% \d+%\)$/);
  });

  it("should convert white to hex", () => {
    expect(convertColor(WHITE, "hex")).toBe("#ffffff");
  });

  it("should convert black to hex", () => {
    expect(convertColor(BLACK, "hex")).toBe("#000000");
  });
});

// ─── convertToAllFormats ────────────────────────────────────────────────────

describe("convertToAllFormats", () => {
  it("should return all 5 formats", () => {
    const result = convertToAllFormats(RED);
    expect(Object.keys(result)).toHaveLength(5);
    expect(result["hex"]).toBeDefined();
    expect(result["rgb"]).toBeDefined();
    expect(result["hsl"]).toBeDefined();
    expect(result["oklch"]).toBeDefined();
    expect(result["hwb"]).toBeDefined();
  });
});

// ─── calculateContrast ──────────────────────────────────────────────────────

describe("calculateContrast", () => {
  it("should return 21:1 for black on white", () => {
    const ratio = calculateContrast(BLACK, WHITE);
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("should return 21:1 for white on black", () => {
    const ratio = calculateContrast(WHITE, BLACK);
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("should return 1:1 for same color", () => {
    const ratio = calculateContrast(RED, RED);
    expect(ratio).toBeCloseTo(1, 1);
  });

  it("should return 1:1 for white on white", () => {
    const ratio = calculateContrast(WHITE, WHITE);
    expect(ratio).toBeCloseTo(1, 1);
  });

  it("should be symmetric (fg/bg order gives same ratio)", () => {
    const a = calculateContrast(RED, WHITE);
    const b = calculateContrast(WHITE, RED);
    expect(a).toBeCloseTo(b, 5);
  });

  it("should give a ratio > 1 for different colors", () => {
    const ratio = calculateContrast(BLUE, WHITE);
    expect(ratio).toBeGreaterThan(1);
  });
});

// ─── relativeLuminance ──────────────────────────────────────────────────────

describe("relativeLuminance", () => {
  it("should return 0 for black", () => {
    expect(relativeLuminance(BLACK)).toBeCloseTo(0, 5);
  });

  it("should return 1 for white", () => {
    expect(relativeLuminance(WHITE)).toBeCloseTo(1, 5);
  });

  it("should return correct luminance for pure red", () => {
    // sRGB linearized red = (1+0.055)/1.055)^2.4 = 1, luminance = 0.2126
    expect(relativeLuminance(RED)).toBeCloseTo(0.2126, 3);
  });
});

// ─── getWcagLevel ───────────────────────────────────────────────────────────

describe("getWcagLevel", () => {
  it("should return AAA for ratio >= 7", () => {
    expect(getWcagLevel(7)).toBe("AAA");
    expect(getWcagLevel(21)).toBe("AAA");
    expect(getWcagLevel(10.5)).toBe("AAA");
  });

  it("should return AA for ratio >= 4.5 and < 7", () => {
    expect(getWcagLevel(4.5)).toBe("AA");
    expect(getWcagLevel(6.99)).toBe("AA");
    expect(getWcagLevel(5)).toBe("AA");
  });

  it("should return Fail for ratio < 4.5", () => {
    expect(getWcagLevel(4.49)).toBe("Fail");
    expect(getWcagLevel(1)).toBe("Fail");
    expect(getWcagLevel(3)).toBe("Fail");
  });
});

// ─── checkContrast ──────────────────────────────────────────────────────────

describe("checkContrast", () => {
  it("should pass all levels for black on white", () => {
    const result = checkContrast(BLACK, WHITE);
    expect(result.passesAA).toBe(true);
    expect(result.passesAAA).toBe(true);
    expect(result.passesAALarge).toBe(true);
    expect(result.level).toBe("AAA");
  });

  it("should fail all for same color", () => {
    const result = checkContrast(RED, RED);
    expect(result.passesAA).toBe(false);
    expect(result.passesAAA).toBe(false);
    expect(result.passesAALarge).toBe(false);
    expect(result.level).toBe("Fail");
  });
});

// ─── generatePalette ────────────────────────────────────────────────────────

describe("generatePalette", () => {
  it("should return 2 colors for complementary", () => {
    const palette = generatePalette(RED, "complementary");
    expect(palette).toHaveLength(2);
    expect(palette[0]!.label).toBe("Base");
    expect(palette[1]!.label).toBe("Complementary");
  });

  it("complementary of red should be approximately cyan", () => {
    const palette = generatePalette(RED, "complementary");
    const comp = palette[1]!;
    // Complementary of red (h=0) is h=180 (cyan)
    expectClose(comp.color.g, 1, 0.05);
    expectClose(comp.color.b, 1, 0.05);
  });

  it("should return 4 colors for analogous", () => {
    const palette = generatePalette(RED, "analogous");
    expect(palette).toHaveLength(4);
  });

  it("should return 3 colors for triadic", () => {
    const palette = generatePalette(RED, "triadic");
    expect(palette).toHaveLength(3);
    expect(palette[0]!.label).toBe("Base");
  });

  it("should return 5 colors for shades", () => {
    const palette = generatePalette(RED, "shades");
    expect(palette).toHaveLength(5);
    expect(palette[0]!.label).toBe("Lighter");
    expect(palette[4]!.label).toBe("Darker");
  });

  it("should include hex strings on all palette colors", () => {
    const palette = generatePalette(BLUE, "triadic");
    for (const pc of palette) {
      expect(pc.hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("shades should produce lighter and darker variants", () => {
    const palette = generatePalette(RED, "shades");
    const lighterLum = relativeLuminance(palette[0]!.color);
    const baseLum = relativeLuminance(palette[2]!.color);
    const darkerLum = relativeLuminance(palette[4]!.color);
    expect(lighterLum).toBeGreaterThan(baseLum);
    expect(darkerLum).toBeLessThan(baseLum);
  });
});

// ─── processColorConversion ─────────────────────────────────────────────────

describe("processColorConversion", () => {
  it("should return a full result for valid input", () => {
    const result = processColorConversion("#ff5733");
    expect(result).not.toBeNull();
    expect(result!.id).toBeDefined();
    expect(result!.conversions["hex"]).toBeDefined();
    expect(result!.conversions["rgb"]).toBeDefined();
    expect(result!.conversions["hsl"]).toBeDefined();
    expect(result!.conversions["oklch"]).toBeDefined();
    expect(result!.conversions["hwb"]).toBeDefined();
    expect(result!.timestamp).toBeDefined();
  });

  it("should return null for invalid input", () => {
    expect(processColorConversion("not a color")).toBeNull();
    expect(processColorConversion("")).toBeNull();
  });

  it("should preserve original input", () => {
    const result = processColorConversion("rgb(100, 200, 50)");
    expect(result).not.toBeNull();
    expect(result!.input).toBe("rgb(100, 200, 50)");
  });
});
