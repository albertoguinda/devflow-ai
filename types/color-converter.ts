// Color Converter & Palette Types

export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch" | "hwb";

export type PaletteType = "complementary" | "analogous" | "triadic" | "shades";

/**
 * Normalized color value with RGBA channels in 0-1 range.
 * All internal math operates on this representation.
 */
export interface ColorValue {
  r: number; // 0-1
  g: number; // 0-1
  b: number; // 0-1
  a: number; // 0-1
}

export interface ColorResult {
  id: string;
  input: string;
  color: ColorValue;
  conversions: Record<ColorFormat, string>;
  timestamp: string;
}

export interface ContrastResult {
  ratio: number;
  level: WcagLevel;
  passesAA: boolean;
  passesAAA: boolean;
  passesAALarge: boolean;
}

export type WcagLevel = "AAA" | "AA" | "Fail";

export interface PaletteColor {
  color: ColorValue;
  hex: string;
  label: string;
}

export const COLOR_FORMATS: ColorFormat[] = ["hex", "rgb", "hsl", "oklch", "hwb"];

export const PALETTE_TYPES: PaletteType[] = ["complementary", "analogous", "triadic", "shades"];
