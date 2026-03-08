"use client";

import { useState } from "react";
import { Input } from "@heroui/react";
import {
  Palette,
  RotateCcw,
  Pipette,
  Eye,
  Sparkles,
  SwatchBook,
  Clock,
  Trash2,
} from "lucide-react";
import { useColorConverter } from "@/hooks/use-color-converter";
import { useTranslation } from "@/hooks/use-translation";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, Card } from "@/components/ui";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { cn } from "@/lib/utils";
import { COLOR_FORMATS, PALETTE_TYPES } from "@/types/color-converter";

export default function ColorConverterPage() {
  const { t } = useTranslation();
  const {
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
  } = useColorConverter();

  // Color picker state (native picker returns hex)
  const [pickerColor, setPickerColor] = useState("#6366f1");

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setPickerColor(hex);
    setInputFromPicker(hex);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      convert();
    }
  };

  // Build hex for preview swatch
  const previewHex = result?.conversions["hex"] ?? (parsedColor ? `rgb(${Math.round(parsedColor.r * 255)}, ${Math.round(parsedColor.g * 255)}, ${Math.round(parsedColor.b * 255)})` : null);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ToolHeader
        icon={Palette}
        gradient="from-pink-500 to-rose-600"
        title={t("color.title")}
        description={t("color.description")}
        breadcrumb
        actions={
          <Button variant="outline" size="sm" onPress={reset} className="gap-2">
            <RotateCcw className="size-4" />
            {t("common.reset")}
          </Button>
        }
      />

      <ToolSuggestions toolId="color-converter" input={input} output={result?.conversions["hex"] ?? ""} />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* ─── Input Column ─── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Color Input Card */}
          <Card className="relative overflow-hidden p-6 border-border/40">
            <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-pink-500 to-rose-600" />

            <div className="space-y-4">
              <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">
                {t("color.inputLabel")}
              </label>

              {/* Color swatch preview */}
              <div className="flex items-center gap-3">
                <div
                  className="size-12 rounded-xl border-2 border-divider shadow-inner flex-shrink-0 transition-colors duration-200"
                  style={{ backgroundColor: previewHex ?? "transparent" }}
                  aria-label={t("color.previewSwatch")}
                >
                  {!previewHex && (
                    <div className="size-full flex items-center justify-center text-muted-foreground/40">
                      <Pipette className="size-5" />
                    </div>
                  )}
                </div>

                {/* Native color picker */}
                <label className="relative cursor-pointer" aria-label={t("color.pickColor")}>
                  <input
                    type="color"
                    value={pickerColor}
                    onChange={handlePickerChange}
                    className="absolute inset-0 opacity-0 cursor-pointer size-10"
                    aria-label={t("color.pickColor")}
                  />
                  <div className="size-10 rounded-lg border-2 border-dashed border-divider flex items-center justify-center hover:border-primary/50 transition-colors">
                    <Pipette className="size-4 text-muted-foreground" />
                  </div>
                </label>
              </div>

              {/* Text input */}
              <Input
                variant="primary"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("color.inputPlaceholder")}
                aria-label={t("color.inputLabel")}
              />

              <p className="text-xs text-muted-foreground italic">
                {t("color.supportedFormats")}
              </p>

              <Button
                onPress={convert}
                variant="primary"
                isDisabled={!input.trim()}
                className="btn-luxury w-full h-12 font-black bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 border-0 transition-all text-md"
              >
                <Sparkles className="size-4 mr-2" />
                {t("color.convert")}
              </Button>
            </div>
          </Card>

          {/* ─── Contrast Checker ─── */}
          <Card className="relative overflow-hidden p-6 border-border/40">
            <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-violet-500 to-purple-600" />

            <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1 mb-4 flex items-center gap-2">
              <Eye className="size-3" />
              {t("color.contrastChecker")}
            </h3>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground/70 ml-1">
                  {t("color.foreground")}
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="size-8 rounded-lg border border-divider flex-shrink-0 transition-colors"
                    style={{ backgroundColor: fgColor ? `rgb(${Math.round(fgColor.r * 255)}, ${Math.round(fgColor.g * 255)}, ${Math.round(fgColor.b * 255)})` : "transparent" }}
                  />
                  <Input
                    variant="primary"
                    value={fgInput}
                    onChange={(e) => setFgInput(e.target.value)}
                    placeholder="#000000"
                    aria-label={t("color.foreground")}
                    className="flex-1"
                  />
                </div>
                {result && (
                  <Button size="sm" variant="ghost" onPress={() => applyToContrast("fg")} className="text-xs">
                    {t("color.useCurrentAsFg")}
                  </Button>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground/70 ml-1">
                  {t("color.background")}
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="size-8 rounded-lg border border-divider flex-shrink-0 transition-colors"
                    style={{ backgroundColor: bgColor ? `rgb(${Math.round(bgColor.r * 255)}, ${Math.round(bgColor.g * 255)}, ${Math.round(bgColor.b * 255)})` : "transparent" }}
                  />
                  <Input
                    variant="primary"
                    value={bgInput}
                    onChange={(e) => setBgInput(e.target.value)}
                    placeholder="#ffffff"
                    aria-label={t("color.background")}
                    className="flex-1"
                  />
                </div>
                {result && (
                  <Button size="sm" variant="ghost" onPress={() => applyToContrast("bg")} className="text-xs">
                    {t("color.useCurrentAsBg")}
                  </Button>
                )}
              </div>

              {/* Contrast Result */}
              {contrastResult ? (
                <div className="space-y-3 pt-3 border-t border-divider">
                  {/* Live preview */}
                  <div
                    className="p-4 rounded-xl border border-divider text-center font-bold transition-colors"
                    style={{
                      color: fgColor ? `rgb(${Math.round(fgColor.r * 255)}, ${Math.round(fgColor.g * 255)}, ${Math.round(fgColor.b * 255)})` : "#000",
                      backgroundColor: bgColor ? `rgb(${Math.round(bgColor.r * 255)}, ${Math.round(bgColor.g * 255)}, ${Math.round(bgColor.b * 255)})` : "#fff",
                    }}
                  >
                    {t("color.sampleText")}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black">
                      {contrastResult.ratio.toFixed(2)}:1
                    </span>
                    <StatusBadge
                      variant={
                        contrastResult.level === "AAA"
                          ? "success"
                          : contrastResult.level === "AA"
                            ? "warning"
                            : "error"
                      }
                      size="md"
                    >
                      WCAG {contrastResult.level}
                    </StatusBadge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className={cn("p-2 rounded-lg", contrastResult.passesAAA ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400")}>
                      <div className="font-black">AAA</div>
                      <div>{contrastResult.passesAAA ? t("color.pass") : t("color.fail")}</div>
                    </div>
                    <div className={cn("p-2 rounded-lg", contrastResult.passesAA ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400")}>
                      <div className="font-black">AA</div>
                      <div>{contrastResult.passesAA ? t("color.pass") : t("color.fail")}</div>
                    </div>
                    <div className={cn("p-2 rounded-lg", contrastResult.passesAALarge ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400")}>
                      <div className="font-black">{t("color.aaLarge")}</div>
                      <div>{contrastResult.passesAALarge ? t("color.pass") : t("color.fail")}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/60 italic text-center py-2">
                  {t("color.contrastEmpty")}
                </p>
              )}
            </div>
          </Card>

          {/* ─── History ─── */}
          {history.length > 0 && (
            <Card className="p-4 border-border/40">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                  <Clock className="size-3" />
                  {t("color.history")}
                </h3>
                <Button size="sm" variant="ghost" onPress={clearHistory} className="text-xs">
                  <Trash2 className="size-3 mr-1" />
                  {t("common.clear")}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="group flex items-center gap-2 rounded-lg border border-divider px-2.5 py-1.5 text-xs font-mono hover:border-primary/40 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    onClick={() => setInput(item.input)}
                    aria-label={`${t("color.applyColor")} ${item.hex}`}
                  >
                    <div
                      className="size-4 rounded border border-divider flex-shrink-0"
                      style={{ backgroundColor: item.hex }}
                    />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                      {item.hex}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* ─── Results Column ─── */}
        <div className="lg:col-span-8 space-y-6">
          {result && conversions ? (
            <>
              {/* Conversion Grid */}
              <div className="space-y-3">
                <h3 className="font-black text-lg flex items-center gap-2">
                  <Palette className="size-5 text-primary" />
                  {t("color.conversions")}
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  {COLOR_FORMATS.map((format) => {
                    const val = conversions[format] ?? "";
                    return (
                      <Card
                        key={format}
                        className="p-4 border-border/40 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black uppercase text-muted-foreground tracking-widest">
                            {format.toUpperCase()}
                          </span>
                          <CopyButton text={val} />
                        </div>
                        <code className="text-sm font-mono font-bold break-all">
                          {val}
                        </code>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Color Info */}
              <Card className="p-6 border-border/40">
                <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-4">
                  {t("color.colorInfo")}
                </h3>
                <div className="flex items-center gap-6">
                  <div
                    className="size-24 rounded-2xl border-2 border-divider shadow-lg flex-shrink-0 transition-colors duration-300"
                    style={{ backgroundColor: result.conversions["hex"] }}
                    aria-label={t("color.previewSwatch")}
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                    <div>
                      <span className="text-xs font-bold text-muted-foreground/60 uppercase">R</span>
                      <p className="text-lg font-black">{Math.round(result.color.r * 255)}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-muted-foreground/60 uppercase">G</span>
                      <p className="text-lg font-black">{Math.round(result.color.g * 255)}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-muted-foreground/60 uppercase">B</span>
                      <p className="text-lg font-black">{Math.round(result.color.b * 255)}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-muted-foreground/60 uppercase">A</span>
                      <p className="text-lg font-black">{Math.round(result.color.a * 100)}%</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Palette Generator */}
              <Card className="relative overflow-hidden p-6 border-border/40">
                <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-amber-500 to-orange-600" />

                <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-4 flex items-center gap-2">
                  <SwatchBook className="size-3" />
                  {t("color.paletteGenerator")}
                </h3>

                {/* Palette type selector */}
                <div className="flex flex-wrap gap-2 mb-6" role="radiogroup" aria-label={t("color.paletteType")}>
                  {PALETTE_TYPES.map((pType) => (
                    <Button
                      key={pType}
                      size="sm"
                      aria-pressed={paletteType === pType}
                      variant={paletteType === pType ? "primary" : "ghost"}
                      onPress={() => setPaletteType(pType)}
                      className="text-xs font-bold capitalize"
                    >
                      {t(`color.palette.${pType}`)}
                    </Button>
                  ))}
                </div>

                {/* Palette swatches */}
                <div className="flex gap-2 flex-wrap">
                  {paletteColors.map((pc, i) => (
                    <div key={i} className="group flex flex-col items-center gap-2 flex-1 min-w-[72px]">
                      <div
                        className="w-full aspect-square rounded-xl border-2 border-divider shadow-md group-hover:scale-105 transition-transform duration-200 cursor-pointer"
                        style={{ backgroundColor: pc.hex }}
                        title={pc.hex}
                        aria-label={`${pc.label}: ${pc.hex}`}
                      />
                      <span className="text-xs font-bold text-muted-foreground/70">{pc.label}</span>
                      <div className="flex items-center gap-1">
                        <code className="text-xs font-mono text-muted-foreground">{pc.hex}</code>
                        <CopyButton text={pc.hex} size="sm" className="size-6 min-w-0 px-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            /* Empty state */
            <Card className="relative p-20 border-dashed border-2 border-pink-500/20 overflow-hidden flex flex-col items-center justify-center text-center h-[400px] sm:h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-rose-500/5" />
              <div className="relative">
                <div className="size-24 rounded-2xl bg-gradient-to-br from-pink-500/15 to-rose-500/15 flex items-center justify-center mb-6 mx-auto">
                  <Palette className="size-12 text-pink-500/40" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-foreground/60">
                  {t("color.emptyTitle")}
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                  {t("color.emptyDescription")}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
