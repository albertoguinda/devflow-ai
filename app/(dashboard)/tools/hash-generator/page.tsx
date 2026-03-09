"use client";

import { useMemo, useCallback } from "react";
import { useShareState } from "@/hooks/use-share-state";
import { ShareButton } from "@/components/shared/share-button";
import {
  Hash,
  RotateCcw,
  ShieldCheck,
  Search,
  Key,
  GitCompareArrows,
} from "lucide-react";
import { TextArea } from "@heroui/react";
import { useHashGenerator } from "@/hooks/use-hash-generator";
import { useTranslation } from "@/hooks/use-translation";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { Button, Card } from "@/components/ui";
import { HASH_ALGORITHM_LABELS } from "@/types/hash-generator";
import type { HashAlgorithm, HashOutputFormat } from "@/types/hash-generator";
import { cn } from "@/lib/utils";
import { useToolShortcuts } from "@/hooks/use-tool-shortcuts";
import { KbdHint } from "@/components/shared/kbd-hint";

const ALGORITHMS: HashAlgorithm[] = ["md5", "sha1", "sha256", "sha384", "sha512"];
const OUTPUT_FORMATS: { value: HashOutputFormat; label: string }[] = [
  { value: "hex", label: "Hex" },
  { value: "uppercase-hex", label: "HEX" },
  { value: "base64", label: "Base64" },
];

export default function HashGeneratorPage() {
  const { t } = useTranslation();
  const {
    input,
    config,
    result,
    allHashes,
    isGenerating,
    hmacKey,
    hmacResult,
    compareA,
    compareB,
    compareResult,
    detectInput,
    detection,
    setInput,
    setHmacKey,
    setCompareA,
    setCompareB,
    setDetectInput,
    generate,
    generateHmacHash,
    compare,
    detect,
    updateAlgorithm,
    updateOutputFormat,
    reset,
  } = useHashGenerator();

  const handleShareLoad = useCallback((state: Record<string, string>) => {
    if (state["input"]) setInput(state["input"]);
  }, [setInput]);

  const { share } = useShareState({ toolSlug: "hash-generator", onLoad: handleShareLoad });

  const getShareUrl = useCallback(() => {
    return share({ input });
  }, [share, input]);

  useToolShortcuts({
    onExecute: generate,
    onCopyOutput: () => {
      if (result?.hash) {
        try { void navigator.clipboard.writeText(result.hash); } catch { /* noop */ }
      }
    },
    onShare: getShareUrl,
    onClear: reset,
  });

  const canGenerate = useMemo(() => input.trim().length > 0, [input]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in-up">
      <ToolHeader
        title={t("hash.title")}
        description={t("hash.description")}
        icon={Hash}
        gradient="from-slate-500 to-zinc-600"
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

      {/* Input Section */}
      <Card>
        <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-slate-500 to-zinc-600" />
        <div className="p-4 md:p-6 space-y-4">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("hash.inputPlaceholder")}
            aria-label={t("hash.inputLabel")}
            className="h-32 sm:h-48 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-xs focus:ring-2 focus:ring-primary/20 shadow-inner"
          />

          {/* Algorithm selector */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{t("hash.algorithm")}</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t("hash.algorithm")}>
              {ALGORITHMS.map((algo) => (
                <Button
                  key={algo}
                  size="sm"
                  variant={config.algorithm === algo ? "primary" : "ghost"}
                  onPress={() => updateAlgorithm(algo)}
                  aria-pressed={config.algorithm === algo}
                >
                  {HASH_ALGORITHM_LABELS[algo]}
                </Button>
              ))}
            </div>
          </div>

          {/* Output format selector */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{t("hash.outputFormat")}</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t("hash.outputFormat")}>
              {OUTPUT_FORMATS.map((fmt) => (
                <Button
                  key={fmt.value}
                  size="sm"
                  variant={config.outputFormat === fmt.value ? "primary" : "ghost"}
                  onPress={() => updateOutputFormat(fmt.value)}
                  aria-pressed={config.outputFormat === fmt.value}
                >
                  {fmt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <Button
            onPress={generate}
            isDisabled={!canGenerate}
            isLoading={isGenerating}
            variant="primary"
            className="btn-luxury w-full h-12 font-black bg-gradient-to-r from-slate-500 to-zinc-600 text-white shadow-lg shadow-slate-500/25 hover:shadow-xl hover:shadow-slate-500/30 border-0 transition-all text-md"
          >
            <ShieldCheck className="size-5 mr-2" aria-hidden="true" />
            {t("hash.generate")} <KbdHint shortcut="⌘↵" className="ml-2" />
          </Button>
        </div>
      </Card>

      {/* Primary Result */}
      {result && (
        <Card>
          <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-slate-500 to-zinc-600" />
          <div className="p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {HASH_ALGORITHM_LABELS[result.algorithm]} {t("hash.result")}
              </h2>
              <CopyButton text={result.hash} />
            </div>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono text-foreground break-all whitespace-pre-wrap">
              {result.hash}
            </pre>
          </div>
        </Card>
      )}

      {/* All Hashes */}
      {allHashes && (
        <Card>
          <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-zinc-400 to-slate-500" />
          <div className="p-4 md:p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t("hash.allAlgorithms")}</h2>
            <div className="space-y-2">
              {ALGORITHMS.map((algo) => {
                const hashVal = allHashes[algo];
                return (
                  <div key={algo} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                    <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground backdrop-blur-sm border border-border/30 min-w-[60px] text-center">
                      {HASH_ALGORITHM_LABELS[algo]}
                    </span>
                    <code className="flex-1 break-all text-xs font-mono text-foreground">{hashVal}</code>
                    <CopyButton text={hashVal} />
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* HMAC Section */}
      <Card>
        <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-amber-500 to-orange-600" />
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Key className="size-5 text-amber-500" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground">{t("hash.hmac")}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{t("hash.hmacDescription")}</p>
          <TextArea
            value={hmacKey}
            onChange={(e) => setHmacKey(e.target.value)}
            placeholder={t("hash.hmacKeyPlaceholder")}
            aria-label={t("hash.hmacKeyLabel")}
            className="h-20 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-xs focus:ring-2 focus:ring-primary/20 shadow-inner"
          />
          <Button
            onPress={generateHmacHash}
            isDisabled={!canGenerate || !hmacKey.trim()}
            isLoading={isGenerating}
            variant="primary"
            size="sm"
          >
            <Key className="size-4 mr-1.5" aria-hidden="true" />
            {t("hash.generateHmac")}
          </Button>
          {hmacResult && (
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <span className="shrink-0 rounded bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                HMAC-{HASH_ALGORITHM_LABELS[config.algorithm]}
              </span>
              <code className="flex-1 break-all text-xs font-mono text-foreground">{hmacResult}</code>
              <CopyButton text={hmacResult} />
            </div>
          )}
        </div>
      </Card>

      {/* Compare Hashes */}
      <Card>
        <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-emerald-500 to-teal-600" />
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <GitCompareArrows className="size-5 text-emerald-500" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground">{t("hash.compare")}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{t("hash.compareDescription")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextArea
              value={compareA}
              onChange={(e) => setCompareA(e.target.value)}
              placeholder={t("hash.hashA")}
              aria-label={t("hash.hashA")}
              className="h-20 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-xs focus:ring-2 focus:ring-primary/20 shadow-inner"
            />
            <TextArea
              value={compareB}
              onChange={(e) => setCompareB(e.target.value)}
              placeholder={t("hash.hashB")}
              aria-label={t("hash.hashB")}
              className="h-20 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-xs focus:ring-2 focus:ring-primary/20 shadow-inner"
            />
          </div>
          <Button
            onPress={compare}
            isDisabled={!compareA.trim() || !compareB.trim()}
            variant="primary"
            size="sm"
          >
            <GitCompareArrows className="size-4 mr-1.5" aria-hidden="true" />
            {t("hash.compareBtn")}
          </Button>
          {compareResult !== null && (
            <div
              className={cn(
                "rounded-lg p-3 text-sm font-medium",
                compareResult
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300"
              )}
              role="alert"
            >
              {compareResult ? t("hash.match") : t("hash.noMatch")}
            </div>
          )}
        </div>
      </Card>

      {/* Detect Hash Type */}
      <Card>
        <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-violet-500 to-purple-600" />
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="size-5 text-violet-500" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground">{t("hash.detect")}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{t("hash.detectDescription")}</p>
          <TextArea
            value={detectInput}
            onChange={(e) => setDetectInput(e.target.value)}
            placeholder={t("hash.detectPlaceholder")}
            aria-label={t("hash.detectLabel")}
            className="h-20 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-xs focus:ring-2 focus:ring-primary/20 shadow-inner"
          />
          <Button onPress={detect} isDisabled={!detectInput.trim()} variant="primary" size="sm">
            <Search className="size-4 mr-1.5" aria-hidden="true" />
            {t("hash.detectBtn")}
          </Button>
          {detection && (
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <p className="text-sm text-foreground">
                {t("hash.length")}: <strong>{detection.length}</strong> |{" "}
                {t("hash.isHex")}: <strong>{detection.isHex ? t("common.yes") : t("common.no")}</strong>
              </p>
              {detection.possibleAlgorithms.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {detection.possibleAlgorithms.map((algo) => (
                    <span
                      key={algo}
                      className="rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-bold text-violet-600 dark:text-violet-400"
                    >
                      {HASH_ALGORITHM_LABELS[algo]}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("hash.noAlgorithmDetected")}</p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Empty state */}
      {!result && (
        <div className="text-center text-muted-foreground py-8">
          <Hash className="size-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
          <p className="text-sm">{t("hash.emptyState")}</p>
          <p className="text-xs mt-1 text-muted-foreground">{t("hash.emptyStateHint")}</p>
        </div>
      )}

      {/* Cross-tool suggestions */}
      <ToolSuggestions toolId="hash-generator" input={result?.hash ?? input} output={result?.hash ?? ""} />
    </div>
  );
}
