"use client";

import { useMemo } from "react";
import {
  GitCompareArrows,
  RotateCcw,
  ArrowLeftRight,
  Plus,
  Minus,
  Equal,
} from "lucide-react";
import { TextArea } from "@heroui/react";
import { useDiffComparer } from "@/hooks/use-diff-comparer";
import { useTranslation } from "@/hooks/use-translation";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { DiffLine, DiffViewMode } from "@/types/diff-comparer";

const VIEW_MODES: { value: DiffViewMode; labelKey: string }[] = [
  { value: "unified", labelKey: "diff.viewUnified" },
  { value: "side-by-side", labelKey: "diff.viewSideBySide" },
];

function DiffLineRow({ line }: { line: DiffLine }) {
  const bgClass =
    line.type === "added"
      ? "bg-emerald-50 dark:bg-emerald-950/40"
      : line.type === "removed"
        ? "bg-red-50 dark:bg-red-950/40"
        : "";

  const textClass =
    line.type === "added"
      ? "text-emerald-800 dark:text-emerald-300"
      : line.type === "removed"
        ? "text-red-800 dark:text-red-300"
        : "text-foreground";

  const prefix =
    line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";

  return (
    <div className={cn("flex font-mono text-xs leading-6", bgClass)}>
      <span className="shrink-0 w-10 text-right px-1.5 text-muted-foreground select-none border-r border-divider">
        {line.lineNumber.old ?? ""}
      </span>
      <span className="shrink-0 w-10 text-right px-1.5 text-muted-foreground select-none border-r border-divider">
        {line.lineNumber.new ?? ""}
      </span>
      <span className={cn("shrink-0 w-5 text-center select-none font-bold", textClass)}>
        {prefix}
      </span>
      <span className={cn("flex-1 px-2 whitespace-pre-wrap break-all", textClass)}>
        {line.content}
      </span>
    </div>
  );
}

function SideBySideView({ lines }: { lines: DiffLine[] }) {
  const { leftLines, rightLines } = useMemo(() => {
    const left: (DiffLine | null)[] = [];
    const right: (DiffLine | null)[] = [];

    for (const line of lines) {
      if (line.type === "unchanged") {
        left.push(line);
        right.push(line);
      } else if (line.type === "removed") {
        left.push(line);
        right.push(null);
      } else {
        left.push(null);
        right.push(line);
      }
    }

    return { leftLines: left, rightLines: right };
  }, [lines]);

  return (
    <div className="grid grid-cols-2 divide-x divide-divider">
      {/* Left (original) */}
      <div className="overflow-x-auto">
        {leftLines.map((line, idx) => {
          const key = `left-${idx}`;
          if (!line) {
            return (
              <div key={key} className="font-mono text-xs leading-6 h-6 bg-muted/30" />
            );
          }
          const bgClass =
            line.type === "removed" ? "bg-red-50 dark:bg-red-950/40" : "";
          const textClass =
            line.type === "removed"
              ? "text-red-800 dark:text-red-300"
              : "text-foreground";
          return (
            <div key={key} className={cn("flex font-mono text-xs leading-6", bgClass)}>
              <span className="shrink-0 w-10 text-right px-1.5 text-muted-foreground select-none border-r border-divider">
                {line.lineNumber.old ?? ""}
              </span>
              <span className={cn("flex-1 px-2 whitespace-pre-wrap break-all", textClass)}>
                {line.content}
              </span>
            </div>
          );
        })}
      </div>
      {/* Right (modified) */}
      <div className="overflow-x-auto">
        {rightLines.map((line, idx) => {
          const key = `right-${idx}`;
          if (!line) {
            return (
              <div key={key} className="font-mono text-xs leading-6 h-6 bg-muted/30" />
            );
          }
          const bgClass =
            line.type === "added" ? "bg-emerald-50 dark:bg-emerald-950/40" : "";
          const textClass =
            line.type === "added"
              ? "text-emerald-800 dark:text-emerald-300"
              : "text-foreground";
          return (
            <div key={key} className={cn("flex font-mono text-xs leading-6", bgClass)}>
              <span className="shrink-0 w-10 text-right px-1.5 text-muted-foreground select-none border-r border-divider">
                {line.lineNumber.new ?? ""}
              </span>
              <span className={cn("flex-1 px-2 whitespace-pre-wrap break-all", textClass)}>
                {line.content}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DiffComparerPage() {
  const { t } = useTranslation();
  const {
    original,
    modified,
    result,
    viewMode,
    isComparing,
    canCompare,
    formattedDiff,
    setOriginal,
    setModified,
    setViewMode,
    compare,
    swap,
    reset,
  } = useDiffComparer();

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in-up">
      <ToolHeader
        title={t("diff.title")}
        description={t("diff.description")}
        icon={GitCompareArrows}
        gradient="from-violet-500 to-purple-600"
        breadcrumb
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onPress={swap} aria-label={t("diff.swap")}>
              <ArrowLeftRight className="size-4" aria-hidden="true" />
              {t("diff.swap")}
            </Button>
            <Button variant="ghost" size="sm" onPress={reset} aria-label={t("common.reset")}>
              <RotateCcw className="size-4" aria-hidden="true" />
              {t("common.reset")}
            </Button>
          </div>
        }
      />

      {/* Input Section — Two textareas */}
      <Card>
        <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-violet-500 to-purple-600" />
        <div className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Original */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{t("diff.original")}</p>
              <TextArea
                value={original}
                onChange={(e) => setOriginal(e.target.value)}
                placeholder={t("diff.originalPlaceholder")}
                aria-label={t("diff.originalLabel")}
                className="h-48 sm:h-64 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-xs focus:ring-2 focus:ring-primary/20 shadow-inner"
              />
            </div>
            {/* Modified */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{t("diff.modified")}</p>
              <TextArea
                value={modified}
                onChange={(e) => setModified(e.target.value)}
                placeholder={t("diff.modifiedPlaceholder")}
                aria-label={t("diff.modifiedLabel")}
                className="h-48 sm:h-64 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-xs focus:ring-2 focus:ring-primary/20 shadow-inner"
              />
            </div>
          </div>

          {/* Compare button */}
          <Button
            onPress={compare}
            isDisabled={!canCompare}
            isLoading={isComparing}
            variant="primary"
            className="btn-luxury w-full h-12 font-black bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 border-0 transition-all text-md"
          >
            <GitCompareArrows className="size-5 mr-2" aria-hidden="true" />
            {t("diff.compare")}
          </Button>
        </div>
      </Card>

      {/* Result Section */}
      {result && (
        <>
          {/* Stats Bar */}
          <Card>
            <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-violet-500 to-purple-600" />
            <div className="p-4 md:p-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Plus className="size-4 text-emerald-500" aria-hidden="true" />
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    +{result.stats.added} {t("diff.added")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Minus className="size-4 text-red-500" aria-hidden="true" />
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    -{result.stats.removed} {t("diff.removed")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Equal className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm font-semibold text-muted-foreground">
                    {result.stats.unchanged} {t("diff.unchanged")}
                  </span>
                </div>

                {/* View mode toggle */}
                <div className="ml-auto flex gap-2" role="group" aria-label={t("diff.viewMode")}>
                  {VIEW_MODES.map((mode) => (
                    <Button
                      key={mode.value}
                      size="sm"
                      variant={viewMode === mode.value ? "primary" : "ghost"}
                      onPress={() => setViewMode(mode.value)}
                      aria-pressed={viewMode === mode.value}
                    >
                      {t(mode.labelKey)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Diff Output */}
          <Card>
            <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-violet-500 to-purple-600" />
            <div className="p-4 md:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">{t("diff.result")}</h2>
                <CopyButton text={formattedDiff} />
              </div>

              <div className="overflow-auto rounded-lg border border-divider bg-muted/30 max-h-[32rem]">
                {result.lines.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    {t("diff.identical")}
                  </div>
                ) : viewMode === "unified" ? (
                  <div>
                    {result.lines.map((line, idx) => (
                      <DiffLineRow key={`diff-${idx}`} line={line} />
                    ))}
                  </div>
                ) : (
                  <SideBySideView lines={result.lines} />
                )}
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Empty state */}
      {!result && (
        <div className="text-center text-muted-foreground py-8">
          <GitCompareArrows className="size-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
          <p className="text-sm">{t("diff.emptyState")}</p>
          <p className="text-xs mt-1 opacity-70">{t("diff.emptyStateHint")}</p>
        </div>
      )}

      {/* Cross-tool suggestions */}
      <ToolSuggestions
        toolId="diff-comparer"
        input={original || modified}
        output={formattedDiff}
      />
    </div>
  );
}
