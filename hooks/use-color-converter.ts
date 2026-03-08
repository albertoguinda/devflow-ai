"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  ColorResult,
  ContrastResult,
  PaletteType,
  PaletteColor,
} from "@/types/color-converter";
import {
  parseColor,
  processColorConversion,
  checkContrast,
  generatePalette,
} from "@/lib/application/color-converter";
import { useToolHistory } from "@/hooks/use-tool-history";

interface HistoryItem {
  id: string;
  input: string;
  hex: string;
  timestamp: string;
}

export function useColorConverter() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ColorResult | null>(null);

  // Contrast checker
  const [fgInput, setFgInput] = useState("#000000");
  const [bgInput, setBgInput] = useState("#ffffff");

  // Palette
  const [paletteType, setPaletteType] = useState<PaletteType>("complementary");

  const { history, addToHistory: addItemToHistory, clearHistory } =
    useToolHistory<HistoryItem>("devflow-color-converter-history", 30);

  // Live-parse the input for the color preview
  const parsedColor = useMemo(() => parseColor(input), [input]);

  // Compute all conversions when we have a result
  const conversions = useMemo(() => {
    if (!result) return null;
    return result.conversions;
  }, [result]);

  // Contrast result
  const contrastResult = useMemo((): ContrastResult | null => {
    const fg = parseColor(fgInput);
    const bg = parseColor(bgInput);
    if (!fg || !bg) return null;
    return checkContrast(fg, bg);
  }, [fgInput, bgInput]);

  const fgColor = useMemo(() => parseColor(fgInput), [fgInput]);
  const bgColor = useMemo(() => parseColor(bgInput), [bgInput]);

  // Palette colors
  const paletteColors = useMemo((): PaletteColor[] => {
    const base = result?.color ?? parsedColor;
    if (!base) return [];
    return generatePalette(base, paletteType);
  }, [result, parsedColor, paletteType]);

  const convert = useCallback(() => {
    if (!input.trim()) return;
    const res = processColorConversion(input);
    if (!res) return;
    setResult(res);

    const hexVal = res.conversions["hex"] ?? "";
    addItemToHistory({
      id: res.id,
      input,
      hex: hexVal,
      timestamp: res.timestamp,
    });
  }, [input, addItemToHistory]);

  const setInputFromPicker = useCallback((hex: string) => {
    setInput(hex);
    const res = processColorConversion(hex);
    if (res) {
      setResult(res);
      const hexVal = res.conversions["hex"] ?? "";
      addItemToHistory({
        id: res.id,
        input: hex,
        hex: hexVal,
        timestamp: res.timestamp,
      });
    }
  }, [addItemToHistory]);

  const applyToContrast = useCallback((which: "fg" | "bg") => {
    const hex = result?.conversions["hex"];
    if (!hex) return;
    if (which === "fg") {
      setFgInput(hex);
    } else {
      setBgInput(hex);
    }
  }, [result]);

  const reset = useCallback(() => {
    setInput("");
    setResult(null);
    setFgInput("#000000");
    setBgInput("#ffffff");
    setPaletteType("complementary");
  }, []);

  return {
    input,
    result,
    parsedColor,
    conversions,
    contrastResult,
    fgInput,
    bgInput,
    fgColor,
    bgColor,
    paletteType,
    paletteColors,
    history,
    setInput,
    setFgInput,
    setBgInput,
    setPaletteType,
    setInputFromPicker,
    convert,
    applyToContrast,
    reset,
    clearHistory,
  };
}
