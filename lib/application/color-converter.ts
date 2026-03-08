// Color Converter & Palette — Pure Application Logic
// Zero external dependencies. Uses only native Math + string operations.

import type {
  ColorFormat,
  ColorValue,
  ColorResult,
  ContrastResult,
  WcagLevel,
  PaletteType,
  PaletteColor,
} from "@/types/color-converter";

// ─── Parsing ────────────────────────────────────────────────────────────────

/**
 * Parse a color string in any supported format into a normalized ColorValue.
 * Returns null if the input cannot be parsed.
 */
export function parseColor(input: string): ColorValue | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  return (
    parseHex(trimmed) ??
    parseRgb(trimmed) ??
    parseHsl(trimmed) ??
    parseOklch(trimmed) ??
    parseHwb(trimmed) ??
    null
  );
}

function parseHex(s: string): ColorValue | undefined {
  // Match #RGB, #RGBA, #RRGGBB, #RRGGBBAA
  const match = /^#([0-9a-f]{3,8})$/.exec(s);
  if (!match) return undefined;
  const hex = match[1];
  if (!hex) return undefined;

  let r: number, g: number, b: number, a = 1;

  if (hex.length === 3) {
    // #RGB
    r = parseInt(hex[0]! + hex[0]!, 16) / 255;
    g = parseInt(hex[1]! + hex[1]!, 16) / 255;
    b = parseInt(hex[2]! + hex[2]!, 16) / 255;
  } else if (hex.length === 4) {
    // #RGBA
    r = parseInt(hex[0]! + hex[0]!, 16) / 255;
    g = parseInt(hex[1]! + hex[1]!, 16) / 255;
    b = parseInt(hex[2]! + hex[2]!, 16) / 255;
    a = parseInt(hex[3]! + hex[3]!, 16) / 255;
  } else if (hex.length === 6) {
    // #RRGGBB
    r = parseInt(hex.slice(0, 2), 16) / 255;
    g = parseInt(hex.slice(2, 4), 16) / 255;
    b = parseInt(hex.slice(4, 6), 16) / 255;
  } else if (hex.length === 8) {
    // #RRGGBBAA
    r = parseInt(hex.slice(0, 2), 16) / 255;
    g = parseInt(hex.slice(2, 4), 16) / 255;
    b = parseInt(hex.slice(4, 6), 16) / 255;
    a = parseInt(hex.slice(6, 8), 16) / 255;
  } else {
    return undefined;
  }

  if ([r, g, b, a].some((v) => Number.isNaN(v))) return undefined;
  return { r, g, b, a };
}

function parseRgb(s: string): ColorValue | undefined {
  // rgb(255, 128, 0) or rgba(255, 128, 0, 0.5)
  // Also rgb(255 128 0) and rgb(255 128 0 / 0.5)
  // eslint-disable-next-line security/detect-unsafe-regex
  const match = /^rgba?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*(?:[,/]\s*([0-9.]+))?\s*\)$/.exec(s);
  if (!match) return undefined;

  const r = parseInt(match[1]!, 10) / 255;
  const g = parseInt(match[2]!, 10) / 255;
  const b = parseInt(match[3]!, 10) / 255;
  const a = match[4] !== undefined ? parseFloat(match[4]) : 1;

  if ([r, g, b, a].some((v) => Number.isNaN(v))) return undefined;
  if (r > 1 || g > 1 || b > 1 || a > 1 || r < 0 || g < 0 || b < 0 || a < 0) return undefined;
  return { r, g, b, a };
}

function parseHsl(s: string): ColorValue | undefined {
  // hsl(360, 100%, 50%) or hsla(360, 100%, 50%, 0.5)
  // eslint-disable-next-line security/detect-unsafe-regex
  const match = /^hsla?\(\s*(\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%\s*(?:[,/]\s*([0-9.]+))?\s*\)$/.exec(s);
  if (!match) return undefined;

  const h = parseFloat(match[1]!) / 360;
  const sat = parseFloat(match[2]!) / 100;
  const l = parseFloat(match[3]!) / 100;
  const a = match[4] !== undefined ? parseFloat(match[4]) : 1;

  if ([h, sat, l, a].some((v) => Number.isNaN(v))) return undefined;
  if (sat > 1 || l > 1 || a > 1 || sat < 0 || l < 0 || a < 0) return undefined;

  const { r, g, b } = hslToRgb(h * 360, sat, l);
  return { r, g, b, a };
}

function parseOklch(s: string): ColorValue | undefined {
  // oklch(0.7 0.15 180) or oklch(0.7 0.15 180 / 0.5)
  // eslint-disable-next-line security/detect-unsafe-regex
  const match = /^oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*(?:\/\s*([0-9.]+))?\s*\)$/.exec(s);
  if (!match) return undefined;

  const L = parseFloat(match[1]!);
  const C = parseFloat(match[2]!);
  const h = parseFloat(match[3]!);
  const a = match[4] !== undefined ? parseFloat(match[4]) : 1;

  if ([L, C, h, a].some((v) => Number.isNaN(v))) return undefined;
  if (L < 0 || L > 1 || C < 0 || a < 0 || a > 1) return undefined;

  const rgb = oklchToRgb(L, C, h);
  return { ...rgb, a };
}

function parseHwb(s: string): ColorValue | undefined {
  // hwb(180 20% 30%) or hwb(180 20% 30% / 0.5)
  // eslint-disable-next-line security/detect-unsafe-regex
  const match = /^hwb\(\s*(\d{1,3}(?:\.\d+)?)\s+(\d{1,3}(?:\.\d+)?)%\s+(\d{1,3}(?:\.\d+)?)%\s*(?:\/\s*([0-9.]+))?\s*\)$/.exec(s);
  if (!match) return undefined;

  const h = parseFloat(match[1]!);
  const w = parseFloat(match[2]!) / 100;
  const bl = parseFloat(match[3]!) / 100;
  const a = match[4] !== undefined ? parseFloat(match[4]) : 1;

  if ([h, w, bl, a].some((v) => Number.isNaN(v))) return undefined;
  if (w < 0 || bl < 0 || a < 0 || a > 1) return undefined;

  const rgb = hwbToRgb(h, w, bl);
  return { ...rgb, a };
}

// ─── Conversion ─────────────────────────────────────────────────────────────

/**
 * Convert a ColorValue to the specified format string.
 */
export function convertColor(value: ColorValue, to: ColorFormat): string {
  switch (to) {
    case "hex":
      return colorToHex(value);
    case "rgb":
      return colorToRgb(value);
    case "hsl":
      return colorToHsl(value);
    case "oklch":
      return colorToOklch(value);
    case "hwb":
      return colorToHwb(value);
  }
}

/**
 * Convert a ColorValue to all supported formats.
 */
export function convertToAllFormats(value: ColorValue): Record<ColorFormat, string> {
  return {
    hex: colorToHex(value),
    rgb: colorToRgb(value),
    hsl: colorToHsl(value),
    oklch: colorToOklch(value),
    hwb: colorToHwb(value),
  };
}

function colorToHex(c: ColorValue): string {
  const r = Math.round(c.r * 255);
  const g = Math.round(c.g * 255);
  const b = Math.round(c.b * 255);
  const hex = `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
  if (c.a < 1) {
    return hex + toHex2(Math.round(c.a * 255));
  }
  return hex;
}

function toHex2(n: number): string {
  return n.toString(16).padStart(2, "0");
}

function colorToRgb(c: ColorValue): string {
  const r = Math.round(c.r * 255);
  const g = Math.round(c.g * 255);
  const b = Math.round(c.b * 255);
  if (c.a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${round(c.a, 2)})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

function colorToHsl(c: ColorValue): string {
  const { h, s, l } = rgbToHsl(c.r, c.g, c.b);
  if (c.a < 1) {
    return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${round(c.a, 2)})`;
  }
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

function colorToOklch(c: ColorValue): string {
  const { L, C, h } = rgbToOklch(c.r, c.g, c.b);
  const base = `oklch(${round(L, 3)} ${round(C, 3)} ${round(h, 1)})`;
  if (c.a < 1) {
    return `oklch(${round(L, 3)} ${round(C, 3)} ${round(h, 1)} / ${round(c.a, 2)})`;
  }
  return base;
}

function colorToHwb(c: ColorValue): string {
  const { h, w, b } = rgbToHwb(c.r, c.g, c.b);
  if (c.a < 1) {
    return `hwb(${Math.round(h)} ${Math.round(w)}% ${Math.round(b)}% / ${round(c.a, 2)})`;
  }
  return `hwb(${Math.round(h)} ${Math.round(w)}% ${Math.round(b)}%)`;
}

// ─── Color Math Helpers ─────────────────────────────────────────────────────

function round(n: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

/** Convert RGB (0-1 each) to HSL (h: 0-360, s: 0-100, l: 0-100) */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;

  if (d === 0) return { h: 0, s: 0, l: l * 100 };

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) {
    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / d + 2) / 6;
  } else {
    h = ((r - g) / d + 4) / 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/** Convert HSL (h: 0-360, s: 0-1, l: 0-1) to RGB (0-1 each) */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  if (s === 0) return { r: l, g: l, b: l };

  const hue2rgb = (p: number, q: number, t: number): number => {
    let tn = t;
    if (tn < 0) tn += 1;
    if (tn > 1) tn -= 1;
    if (tn < 1 / 6) return p + (q - p) * 6 * tn;
    if (tn < 1 / 2) return q;
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hNorm = h / 360;

  return {
    r: hue2rgb(p, q, hNorm + 1 / 3),
    g: hue2rgb(p, q, hNorm),
    b: hue2rgb(p, q, hNorm - 1 / 3),
  };
}

/** Convert RGB (0-1 each) to HWB (h: 0-360, w: 0-100, b: 0-100) */
function rgbToHwb(r: number, g: number, b: number): { h: number; w: number; b: number } {
  const { h } = rgbToHsl(r, g, b);
  const w = Math.min(r, g, b);
  const bl = 1 - Math.max(r, g, b);
  return { h, w: w * 100, b: bl * 100 };
}

/** Convert HWB (h: 0-360, w: 0-1, b: 0-1) to RGB (0-1 each) */
function hwbToRgb(h: number, w: number, bl: number): { r: number; g: number; b: number } {
  // If whiteness + blackness >= 1, it's a shade of gray
  const totalWB = w + bl;
  let wn = w;
  let bn = bl;
  if (totalWB > 1) {
    wn = w / totalWB;
    bn = bl / totalWB;
  }

  const { r, g, b } = hslToRgb(h, 1, 0.5);
  return {
    r: r * (1 - wn - bn) + wn,
    g: g * (1 - wn - bn) + wn,
    b: b * (1 - wn - bn) + wn,
  };
}

// ─── OKLab / OKLCH ──────────────────────────────────────────────────────────

/** sRGB → linear RGB */
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Linear RGB → sRGB */
function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function rgbToOklab(r: number, g: number, b: number): { L: number; a: number; b: number } {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  return {
    L: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  };
}

function oklabToRgb(L: number, a: number, b: number): { r: number; g: number; b: number } {
  const l = L + 0.3963377774 * a + 0.2158037573 * b;
  const m = L - 0.1055613458 * a - 0.0638541728 * b;
  const s = L - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l * l * l;
  const m3 = m * m * m;
  const s3 = s * s * s;

  return {
    r: clamp01(linearToSrgb(+4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3)),
    g: clamp01(linearToSrgb(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3)),
    b: clamp01(linearToSrgb(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3)),
  };
}

function rgbToOklch(r: number, g: number, b: number): { L: number; C: number; h: number } {
  const lab = rgbToOklab(r, g, b);
  const C = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L: lab.L, C, h };
}

function oklchToRgb(L: number, C: number, h: number): { r: number; g: number; b: number } {
  const hRad = (h * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  return oklabToRgb(L, a, b);
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

// ─── WCAG Contrast ──────────────────────────────────────────────────────────

/**
 * Calculate WCAG 2.1 contrast ratio between two colors.
 * Returns a ratio from 1:1 to 21:1.
 */
export function calculateContrast(fg: ColorValue, bg: ColorValue): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculate relative luminance per WCAG 2.1 spec.
 * Uses sRGB linearization.
 */
export function relativeLuminance(c: ColorValue): number {
  const rLinear = srgbToLinear(c.r);
  const gLinear = srgbToLinear(c.g);
  const bLinear = srgbToLinear(c.b);
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Determine WCAG conformance level based on contrast ratio.
 * AAA: >= 7:1, AA: >= 4.5:1, Fail: < 4.5:1
 */
export function getWcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "Fail";
}

/**
 * Full contrast check result.
 */
export function checkContrast(fg: ColorValue, bg: ColorValue): ContrastResult {
  const ratio = calculateContrast(fg, bg);
  return {
    ratio,
    level: getWcagLevel(ratio),
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
    passesAALarge: ratio >= 3,
  };
}

// ─── Palette Generation ─────────────────────────────────────────────────────

/**
 * Generate a color palette from a base color.
 */
export function generatePalette(base: ColorValue, type: PaletteType): PaletteColor[] {
  const { h, s, l } = rgbToHsl(base.r, base.g, base.b);

  switch (type) {
    case "complementary":
      return [
        makePaletteColor(base, "Base"),
        makePaletteColorFromHsl((h + 180) % 360, s, l, base.a, "Complementary"),
      ];
    case "analogous":
      return [
        makePaletteColorFromHsl((h + 330) % 360, s, l, base.a, "-30°"),
        makePaletteColor(base, "Base"),
        makePaletteColorFromHsl((h + 30) % 360, s, l, base.a, "+30°"),
        makePaletteColorFromHsl((h + 60) % 360, s, l, base.a, "+60°"),
      ];
    case "triadic":
      return [
        makePaletteColor(base, "Base"),
        makePaletteColorFromHsl((h + 120) % 360, s, l, base.a, "+120°"),
        makePaletteColorFromHsl((h + 240) % 360, s, l, base.a, "+240°"),
      ];
    case "shades":
      return [
        makePaletteColorFromHsl(h, s, Math.min(l + 30, 95), base.a, "Lighter"),
        makePaletteColorFromHsl(h, s, Math.min(l + 15, 90), base.a, "Light"),
        makePaletteColor(base, "Base"),
        makePaletteColorFromHsl(h, s, Math.max(l - 15, 10), base.a, "Dark"),
        makePaletteColorFromHsl(h, s, Math.max(l - 30, 5), base.a, "Darker"),
      ];
  }
}

function makePaletteColor(color: ColorValue, label: string): PaletteColor {
  return { color, hex: colorToHex(color), label };
}

function makePaletteColorFromHsl(
  h: number,
  s: number,
  l: number,
  a: number,
  label: string,
): PaletteColor {
  const rgb = hslToRgb(h, s / 100, l / 100);
  const color: ColorValue = { ...rgb, a };
  return { color, hex: colorToHex(color), label };
}

// ─── Result Builder ─────────────────────────────────────────────────────────

/**
 * Process a color input string and produce a full result.
 */
export function processColorConversion(input: string): ColorResult | null {
  const color = parseColor(input);
  if (!color) return null;

  return {
    id: crypto.randomUUID(),
    input,
    color,
    conversions: convertToAllFormats(color),
    timestamp: new Date().toISOString(),
  };
}
