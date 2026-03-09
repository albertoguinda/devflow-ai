"use client";

import { useMemo, useCallback } from "react";
import { useShareState } from "@/hooks/use-share-state";
import { ShareButton } from "@/components/shared/share-button";
import { Lock, RotateCcw, Shield, Layers } from "lucide-react";
import { Slider, Switch, Label } from "@heroui/react";
import { usePasswordGenerator } from "@/hooks/use-password-generator";
import { useTranslation } from "@/hooks/use-translation";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useToolShortcuts } from "@/hooks/use-tool-shortcuts";
import { KbdHint } from "@/components/shared/kbd-hint";
import type { PasswordStrengthLevel } from "@/types/password-generator";

const STRENGTH_COLORS: Record<PasswordStrengthLevel, string> = {
  "very-weak": "bg-red-500",
  "weak": "bg-orange-500",
  "fair": "bg-yellow-500",
  "strong": "bg-emerald-500",
  "very-strong": "bg-green-500",
};

const STRENGTH_TEXT_COLORS: Record<PasswordStrengthLevel, string> = {
  "very-weak": "text-red-600 dark:text-red-400",
  "weak": "text-orange-600 dark:text-orange-400",
  "fair": "text-yellow-600 dark:text-yellow-400",
  "strong": "text-emerald-600 dark:text-emerald-400",
  "very-strong": "text-green-600 dark:text-green-400",
};

export default function PasswordGeneratorPage() {
  const { t } = useTranslation();
  const {
    config,
    result,
    strength,
    batchResults,
    isGenerating,
    updateConfig,
    generate,
    generateBatchPasswords,
    reset,
  } = usePasswordGenerator();

  const handleShareLoad = useCallback((state: Record<string, string>) => {
    if (state["length"]) updateConfig("length", Number(state["length"]));
    if (state["uppercase"]) updateConfig("uppercase", state["uppercase"] === "true");
    if (state["lowercase"]) updateConfig("lowercase", state["lowercase"] === "true");
    if (state["numbers"]) updateConfig("numbers", state["numbers"] === "true");
    if (state["symbols"]) updateConfig("symbols", state["symbols"] === "true");
    if (state["excludeAmbiguous"]) updateConfig("excludeAmbiguous", state["excludeAmbiguous"] === "true");
  }, [updateConfig]);

  const { share } = useShareState({ toolSlug: "password-generator", onLoad: handleShareLoad });

  const getShareUrl = useCallback(() => {
    return share({
      length: String(config.length),
      uppercase: String(config.uppercase),
      lowercase: String(config.lowercase),
      numbers: String(config.numbers),
      symbols: String(config.symbols),
      excludeAmbiguous: String(config.excludeAmbiguous),
    });
  }, [share, config.length, config.uppercase, config.lowercase, config.numbers, config.symbols, config.excludeAmbiguous]);

  useToolShortcuts({
    onExecute: generate,
    onCopyOutput: () => {
      if (result?.password) {
        try { void navigator.clipboard.writeText(result.password); } catch { /* noop */ }
      }
    },
    onShare: getShareUrl,
    onClear: reset,
  });

  const canGenerate = useMemo(() => {
    return config.uppercase || config.lowercase || config.numbers || config.symbols;
  }, [config.uppercase, config.lowercase, config.numbers, config.symbols]);

  const strengthBarWidth = useMemo(() => {
    if (!strength) return 0;
    return strength.score;
  }, [strength]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in-up">
      <ToolHeader
        title={t("password.title")}
        description={t("password.description")}
        icon={Lock}
        gradient="from-red-500 to-orange-600"
        breadcrumb
        actions={
          <>
            <ShareButton getShareUrl={getShareUrl} />
            <Button variant="ghost" size="sm" onPress={reset} aria-label={t("common.reset")}>
              <RotateCcw className="size-4" aria-hidden="true" />
              {t("common.reset")}
            </Button>
          </>
        }
      />

      {/* Config Panel */}
      <Card>
        <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-red-500 to-orange-600" />
        <div className="p-4 md:p-6 space-y-6">
          {/* Length Slider */}
          <div>
            <Slider
              minValue={8}
              maxValue={128}
              step={1}
              value={config.length}
              onChange={(v) => updateConfig("length", typeof v === "number" ? v : 16)}
              className="w-full"
              aria-label={t("password.length")}
            >
              <Label>{t("password.length")}</Label>
              <Slider.Output />
              <Slider.Track>
                <Slider.Fill />
                <Slider.Thumb />
              </Slider.Track>
            </Slider>
          </div>

          {/* Character Options */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">{t("password.charOptions")}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Uppercase */}
              <Switch
                isSelected={config.uppercase}
                onChange={(val) => updateConfig("uppercase", val)}
                aria-label={t("password.uppercase")}
              >
                <div className="flex flex-col">
                  <Label className="text-sm font-medium text-foreground">
                    {t("password.uppercase")}
                  </Label>
                  <span className="text-xs text-muted-foreground">A-Z</span>
                </div>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch>

              {/* Lowercase */}
              <Switch
                isSelected={config.lowercase}
                onChange={(val) => updateConfig("lowercase", val)}
                aria-label={t("password.lowercase")}
              >
                <div className="flex flex-col">
                  <Label className="text-sm font-medium text-foreground">
                    {t("password.lowercase")}
                  </Label>
                  <span className="text-xs text-muted-foreground">a-z</span>
                </div>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch>

              {/* Numbers */}
              <Switch
                isSelected={config.numbers}
                onChange={(val) => updateConfig("numbers", val)}
                aria-label={t("password.numbers")}
              >
                <div className="flex flex-col">
                  <Label className="text-sm font-medium text-foreground">
                    {t("password.numbers")}
                  </Label>
                  <span className="text-xs text-muted-foreground">0-9</span>
                </div>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch>

              {/* Symbols */}
              <Switch
                isSelected={config.symbols}
                onChange={(val) => updateConfig("symbols", val)}
                aria-label={t("password.symbols")}
              >
                <div className="flex flex-col">
                  <Label className="text-sm font-medium text-foreground">
                    {t("password.symbols")}
                  </Label>
                  <span className="text-xs text-muted-foreground">{"!@#$%^&*..."}</span>
                </div>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch>
            </div>

            {/* Exclude Ambiguous */}
            <Switch
              isSelected={config.excludeAmbiguous}
              onChange={(val) => updateConfig("excludeAmbiguous", val)}
              aria-label={t("password.excludeAmbiguous")}
            >
              <div className="flex flex-col">
                <Label className="text-sm font-medium text-foreground">
                  {t("password.excludeAmbiguous")}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {t("password.excludeAmbiguousHint")}
                </span>
              </div>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch>
          </div>

          {/* No pools selected warning */}
          {!canGenerate && (
            <div
              className="rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-800 dark:text-red-300"
              role="alert"
              aria-live="assertive"
            >
              {t("password.noPoolsSelected")}
            </div>
          )}

          {/* Generate button */}
          <Button
            onPress={generate}
            isDisabled={!canGenerate}
            isLoading={isGenerating}
            variant="primary"
            className="btn-luxury w-full h-12 font-black bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 border-0 transition-all text-md"
          >
            <Shield className="size-5 mr-2" aria-hidden="true" />
            {t("password.generate")} <KbdHint shortcut="⌘↵" className="ml-2" />
          </Button>
        </div>
      </Card>

      {/* Password Output */}
      {result && (
        <Card>
          <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-red-500 to-orange-600" />
          <div className="p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {t("password.result")}
              </h2>
              <CopyButton text={result.password} />
            </div>

            {/* Password display */}
            <div className="relative rounded-xl bg-muted p-4 font-mono text-lg sm:text-xl text-foreground break-all select-all tracking-wider leading-relaxed">
              {result.password}
            </div>

            {/* Strength meter */}
            {strength && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {t("password.strength")}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      STRENGTH_TEXT_COLORS[strength.level],
                    )}
                  >
                    {t(`password.level.${strength.level}`)}
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  className="h-2.5 w-full rounded-full bg-muted-foreground/20 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={strength.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t("password.strength")}
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      STRENGTH_COLORS[strength.level],
                    )}
                    style={{ width: `${strengthBarWidth}%` }}
                  />
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>
                    {t("password.entropy")}: <strong className="text-foreground">{strength.entropy} {t("password.bits")}</strong>
                  </span>
                  <span>
                    {t("password.crackTime")}: <strong className="text-foreground">{strength.crackTime}</strong>
                  </span>
                  <span>
                    {t("password.lengthLabel")}: <strong className="text-foreground">{result.password.length}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Batch Generation */}
      <Card>
        <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-orange-500 to-amber-600" />
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-orange-500" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground">
              {t("password.batchTitle")}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">{t("password.batchDescription")}</p>

          <Button
            onPress={() => generateBatchPasswords(5)}
            isDisabled={!canGenerate}
            isLoading={isGenerating}
            variant="primary"
            size="sm"
          >
            <Layers className="size-4 mr-1.5" aria-hidden="true" />
            {t("password.generateBatch")}
          </Button>

          {batchResults.length > 0 && (
            <div className="space-y-2">
              {batchResults.map((pw, index) => (
                <div
                  key={`batch-${index}`}
                  className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                >
                  <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground backdrop-blur-sm border border-border/30 min-w-[28px] text-center">
                    {index + 1}
                  </span>
                  <code className="flex-1 break-all text-xs font-mono text-foreground select-all">
                    {pw}
                  </code>
                  <CopyButton text={pw} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Empty state */}
      {!result && batchResults.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          <Lock className="size-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
          <p className="text-sm">{t("password.emptyState")}</p>
          <p className="text-xs mt-1 text-muted-foreground">{t("password.emptyStateHint")}</p>
        </div>
      )}

      {/* Cross-tool suggestions */}
      <ToolSuggestions
        toolId="password-generator"
        input={result?.password ?? ""}
        output={result?.password ?? ""}
      />
    </div>
  );
}
