"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Tabs,
  TextArea,
} from "@heroui/react";
import {
  Binary,
  RotateCcw,
  Sparkles,
  FileJson,
  FileDigit,
  Settings2,
  Trash2,
  Download,
  ArrowRight,
  Database,
  Search,
  Cpu,
  Upload,
  Bot,
  AlertTriangle,
} from "lucide-react";
import { useBase64 } from "@/hooks/use-base64";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { CopyButton } from "@/components/shared/copy-button";
import { AIResultSkeleton } from "@/components/shared/skeletons";
import { ToolHeader } from "@/components/shared/tool-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { DataTable, Button, Card, type ColumnConfig } from "@/components/ui";
import { useAISuggest } from "@/hooks/use-ai-suggest";
import { useAISettingsStore } from "@/lib/stores/ai-settings-store";
import { useLocaleStore } from "@/lib/stores/locale-store";
import { cn } from "@/lib/utils";
export default function Base64Page() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { navigateTo } = useSmartNavigation();
  const {
    input,
    mode,
    config,
    result,
    batchInput,
    batchResults,
    setInput,
    setMode,
    setBatchInput,
    updateConfig,
    process,
    processBatch,
    reset,
    loadExample,
  } = useBase64();

  const { explainBase64WithAI, aiResult, isAILoading, aiError } = useAISuggest();
  const isAIEnabled = useAISettingsStore((s) => s.isAIEnabled);
  const locale = useLocaleStore((s) => s.locale);

  const [activeView, setActiveView] = useState<"text" | "preview" | "inspector" | "batch">("text");

  const byteColumns: ColumnConfig[] = [
    { name: t("table.colOffset"), uid: "offset" },
    { name: t("table.colHex"), uid: "hex" },
    { name: t("table.colBinary"), uid: "binary" },
    { name: t("table.colDecimal"), uid: "decimal" },
  ];

  const byteData = useMemo(() => {
    if (!result?.byteView) return [];
    const hexParts = result.byteView.hex.split(' ');
    const binParts = result.byteView.binary.split(' ');
    return hexParts.map((h, i) => ({
      id: i,
      offset: i.toString(16).padStart(4, '0').toUpperCase(),
      hex: h.toUpperCase(),
      binary: binParts[i],
      decimal: result.byteView?.decimal[i] ?? 0,
    }));
  }, [result]);

  const renderByteCell = useCallback((item: { id: number; offset: string; hex: string; binary: string | undefined; decimal: number | undefined }, columnKey: React.Key) => {
    const key = columnKey.toString() as keyof typeof item;
    switch (key) {
      case "offset": return <span className="font-mono text-xs text-muted-foreground">0x{item.offset}</span>;
      case "hex": return <span className="font-mono text-xs font-black text-primary">{item.hex}</span>;
      case "binary": return <span className="font-mono text-xs opacity-60">{item.binary}</span>;
      case "decimal": return <span className="font-mono text-xs">{item.decimal}</span>;
      default: return String(item[key]);
    }
  }, []);

  const jwtParts = useMemo(() => {
    if (result?.detectedType === "jwt" && result.isValid) {
      const content = mode === "decode" ? result.output : result.input;
      const parts = content.split(".");
      try {
        return {
          header: JSON.stringify(JSON.parse(atob(parts[0]!.replace(/-/g, "+").replace(/_/g, "/"))), null, 2),
          payload: JSON.stringify(JSON.parse(atob(parts[1]!.replace(/-/g, "+").replace(/_/g, "/"))), null, 2),
          signature: parts[2],
        };
      } catch { return null; }
    }
    return null;
  }, [result, mode]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ToolHeader
        icon={Binary}
        gradient="from-indigo-500 to-blue-600"
        title={t("base64.title")}
        description={t("base64.description")}
        breadcrumb
        actions={
          <Button variant="outline" size="sm" onPress={reset} className="gap-2">
            <RotateCcw className="size-4" />
            {t("common.reset")}
          </Button>
        }
      />

      <ToolSuggestions toolId="base64" input={input} output={result?.output || ""} />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Input Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="relative overflow-hidden p-6 border-border/40">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-600" />
            <div className="flex items-center justify-between mb-6 mt-1">
              <div className="flex bg-muted p-1 rounded-xl">
                <Button size="sm" aria-pressed={mode === "encode"} variant={mode === "encode" ? "primary" : "ghost"} onPress={() => setMode("encode")} className="font-bold h-8">{t("base64.encodeBtn")}</Button>
                <Button size="sm" aria-pressed={mode === "decode"} variant={mode === "decode" ? "primary" : "ghost"} onPress={() => setMode("decode")} className="font-bold h-8">{t("base64.decodeBtn")}</Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onPress={() => {
                  const fileInput = document.createElement("input");
                  fileInput.type = "file";
                  fileInput.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) { fileInput.onchange = null; return; }
                    const reader = new FileReader();
                    reader.onerror = () => {
                      addToast(t("base64.fileReadError"), "error");
                      fileInput.onchange = null;
                    };
                    if (mode === "encode") {
                      reader.onload = () => {
                        const base64 = (reader.result as string).split(",")[1];
                        if (base64) setInput(base64);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      reader.onload = () => setInput(reader.result as string);
                      reader.readAsText(file);
                    }
                    fileInput.onchange = null;
                  };
                  fileInput.click();
                }} aria-label={t("base64.uploadFile")}><Upload className="size-3.5 mr-1" />{t("base64.uploadFile")}</Button>
                <Button size="sm" variant="ghost" className="min-h-11" onPress={() => loadExample("json")}>{t("base64.exampleBtn")}</Button>
                <Button size="sm" variant="ghost" onPress={() => setInput("")} isIconOnly aria-label={t("common.clearInput")} className="min-h-11 min-w-11"><Trash2 className="size-3.5 text-danger" /></Button>
              </div>
            </div>

            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "encode" ? t("base64.encodePlaceholder") : t("base64.decodePlaceholder")}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  if (input.trim()) process();
                }
              }}
              className="h-32 sm:h-48 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-xs focus:ring-2 focus:ring-primary/20 shadow-inner"
              aria-label={mode === "encode" ? t("base64.encodePlaceholder") : t("base64.decodePlaceholder")}
            />

            <div className="mt-6 space-y-4 pt-4 border-t border-divider">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-muted-foreground tracking-widest">
                <Settings2 className="size-3" /> {t("base64.configTitle")}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" aria-pressed={config.variant === "standard"} variant={config.variant === "standard" ? "primary" : "ghost"} onPress={() => updateConfig("variant", "standard")} className="font-bold">{t("base64.standardBtn")}</Button>
                <Button size="sm" aria-pressed={config.variant === "url-safe"} variant={config.variant === "url-safe" ? "primary" : "ghost"} onPress={() => updateConfig("variant", "url-safe")} className="font-bold">{t("base64.urlSafeBtn")}</Button>
              </div>
            </div>

            <Button onPress={process} isDisabled={!input.trim()} variant="primary" className="w-full mt-6 h-12 font-black bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 border-0 transition-all text-md">
              <Sparkles className="size-4 mr-2" /> {mode === "encode" ? t("base64.generateEncoding") : t("base64.executeDecoding")}
            </Button>
          </Card>

          {result && (
            <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/15 dark:to-blue-500/15 shadow-xl shadow-primary/5 border border-default-200 dark:border-default-100">
              <h3 className="text-xs font-black uppercase text-muted-foreground mb-6 tracking-widest flex items-center gap-2">
                <FileDigit className="size-3 text-cyan-500 dark:text-cyan-400" /> {t("base64.forensicMetrics")}
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold uppercase text-muted-foreground/60">{t("base64.outputSize")}</span>
                  <span className="text-2xl font-black text-cyan-500 dark:text-cyan-400">{t("base64.bytes", { count: result.stats.outputBytes })}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black uppercase text-muted-foreground/60">
                    <span>{t("base64.byteOverhead")}</span>
                    <span>{Math.round(result.stats.compressionRatio * 100)}%</span>
                  </div>
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 dark:bg-cyan-400"
                      style={{ width: `${Math.min(100, result.stats.compressionRatio * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-default-200">
                  <StatusBadge variant="info">{t("base64.detectedBadge", { type: result.detectedType?.toUpperCase() || "" })}</StatusBadge>
                </div>
              </div>
            </Card>
          )}

          {result && isAIEnabled && (
            <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/15 dark:to-purple-500/15 border border-violet-500/20 dark:border-violet-500/10">
              <h3 className="text-xs font-black uppercase text-violet-600 dark:text-violet-400 mb-4 flex items-center gap-2 tracking-widest">
                <Bot className="size-3" /> {t("base64.aiAnalysis")}
              </h3>
              <Button
                size="sm"
                variant="primary"
                className="w-full font-bold bg-violet-600 dark:bg-violet-500 hover:bg-violet-700 dark:hover:bg-violet-600 border-none shadow-lg shadow-violet-500/20 mb-4"
                onPress={() => {
                  const content = result.output.slice(0, 2000);
                  void explainBase64WithAI(`Type: ${result.detectedType || "unknown"}, Mode: ${mode}, Content (first 2000 chars): ${content}`, locale);
                }}
                isLoading={isAILoading}
              >
                <Bot className="size-4 mr-2" /> {t("base64.aiAnalyzeBtn")}
              </Button>
              {isAILoading && <AIResultSkeleton lines={2} />}
              {aiResult?.suggestions && aiResult.suggestions.length > 0 && !isAILoading && (
                <div className="space-y-3">
                  {aiResult.suggestions.map((s, i) => (
                    <div key={i} className="animate-stagger-item p-3 bg-background/80 rounded-xl border border-violet-500/10 dark:border-violet-500/20">
                      <p className="text-xs font-medium leading-relaxed">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-2 italic">{s.reasoning}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {isAIEnabled && aiError && (
            <Card className="p-3 border-danger/30 bg-danger/5" role="alert" aria-live="assertive">
              <p className="text-xs text-danger font-bold flex items-center gap-2">
                <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                {t("ai.errorOccurred", { message: aiError.message })}
              </p>
            </Card>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs
            selectedKey={activeView}
            onSelectionChange={(k) => setActiveView(k as "text" | "preview" | "inspector")}
            variant="primary"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Tabs.ListContainer>
                <Tabs.List aria-label={t("base64.ariaViewMode")}>
                  <Tabs.Tab id="text">{t("base64.textView")}</Tabs.Tab>
                  <Tabs.Tab id="preview">{t("base64.smartPreview")}</Tabs.Tab>
                  <Tabs.Tab id="inspector">{t("base64.byteInspector")}</Tabs.Tab>
                  <Tabs.Tab id="batch">{t("base64.batchTab")}</Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
              <div className="flex gap-2">
                {result?.detectedType === "json" && (
                  <Button size="sm" variant="ghost" className="font-bold" onPress={() => navigateTo("json-formatter", mode === "decode" ? result.output : result.input)}>
                    <FileJson className="size-3.5 mr-1.5 text-secondary" /> {t("base64.jsonLab")}
                  </Button>
                )}
                <CopyButton text={result?.output || ""} />
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <Tabs.Panel id="text">
                <Card className="p-0 border-indigo-500/20 dark:border-indigo-500/10 shadow-xl shadow-indigo-500/5 overflow-hidden h-[400px] sm:h-[600px] flex flex-col">
                  <div className="p-4 border-b border-indigo-500/10 flex justify-between items-center bg-gradient-to-r from-indigo-500/5 to-blue-500/5">
                    <span className="text-xs font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase tracking-widest">{t("base64.rawPayload")}</span>
                    <span className="text-xs font-mono text-muted-foreground/50">{t("base64.characters", { count: result?.stats.outputLength || 0 })}</span>
                  </div>
                  {result?.output ? (
                    <pre className="p-8 font-mono text-[11px] leading-relaxed overflow-auto flex-1 bg-background break-all">
                      <code>{result.output}</code>
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <div className="size-20 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 flex items-center justify-center mb-4">
                        <Binary className="size-10 text-indigo-500/40" />
                      </div>
                      <p className="text-sm font-bold text-muted-foreground/60">{t("base64.emptyState")}</p>
                      <p className="text-xs text-muted-foreground/40 mt-1">{t("base64.emptyStateHint")}</p>
                    </div>
                  )}
                </Card>
              </Tabs.Panel>

              <Tabs.Panel id="preview">
                <div className="space-y-6 h-[400px] sm:h-[600px] overflow-auto pr-2 scrollbar-hide">
                  {result?.detectedType === "jwt" && jwtParts && (
                    <div className="grid gap-4">
                      <Card className="p-6 border-blue-500/20 dark:border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10">
                        <p className="text-xs font-black text-blue-500 dark:text-blue-400 uppercase mb-3 tracking-widest">{t("base64.jwtHeader")}</p>
                        <pre className="text-xs font-mono text-blue-700 dark:text-blue-300">{jwtParts.header}</pre>
                      </Card>
                      <Card className="p-6 border-purple-500/20 dark:border-purple-500/30 bg-purple-500/5 dark:bg-purple-500/10">
                        <p className="text-xs font-black text-purple-500 dark:text-purple-400 uppercase mb-3 tracking-widest">{t("base64.jwtPayload")}</p>
                        <pre className="text-xs font-mono text-purple-700 dark:text-purple-300">{jwtParts.payload}</pre>
                      </Card>
                      <Card className="p-6 border-divider bg-muted/5">
                        <p className="text-xs font-black text-muted-foreground uppercase mb-3 tracking-widest">{t("base64.jwtSignature")}</p>
                        <p className="text-xs font-mono break-all opacity-40 leading-relaxed">{jwtParts.signature}</p>
                      </Card>
                    </div>
                  )}

                  {result?.detectedType === "image" && (
                    <Card className="p-12 flex flex-col items-center justify-center bg-muted/10 border-dashed border-2">
                      {/* eslint-disable-next-line @next/next/no-img-element -- data URI from user input, next/image cannot optimize */}
                      <img src={mode === "decode" ? `data:image/*;base64,${result.input}` : `data:image/*;base64,${result.output}`} alt="Preview" className="max-w-full max-h-[350px] rounded-2xl shadow-2xl border-4 border-white dark:border-slate-800" />
                      <Button size="md" variant="primary" className="mt-8 font-black shadow-lg" onPress={() => {
                        const a = document.createElement("a");
                        a.href = mode === "decode" ? `data:image/*;base64,${result.input}` : `data:image/*;base64,${result.output}`;
                        a.download = mode === "decode" ? "devflow-decoded" : "devflow-encoded"; a.click();
                      }}>
                        <Download className="size-4 mr-2" /> {t("base64.downloadResource")}
                      </Button>
                    </Card>
                  )}

                  {result?.detectedType === "json" && (
                    <Card className="p-8 border-emerald-500/20 dark:border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 h-full">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-md italic">
                          <Database className="size-5" /> {t("base64.structuredObject")}
                        </h3>
                        <Button size="sm" variant="ghost" className="font-black text-success" onPress={() => navigateTo("json-formatter", mode === "decode" ? result.output : result.input)}>
                          {t("base64.fullAnalysis")} <ArrowRight className="size-3.5 ml-1" />
                        </Button>
                      </div>
                      <pre className="text-xs font-mono text-emerald-700 dark:text-emerald-300 overflow-auto leading-relaxed">
                        {(() => {
                          try {
                            const raw = mode === "decode" ? result.output : result.input;
                            return JSON.stringify(JSON.parse(raw), null, 2);
                          } catch {
                            return mode === "decode" ? result.output : result.input;
                          }
                        })()}
                      </pre>
                    </Card>
                  )}

                  {result?.detectedType && !["jwt", "image", "json"].includes(result.detectedType) && (
                    <Card className="p-20 border-dashed border-2 bg-muted/10 flex flex-col items-center justify-center h-full text-center">
                      <div className="size-20 bg-muted rounded-full flex items-center justify-center mb-6">
                        <Search className="size-10 text-muted-foreground/40" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{t("base64.noPreview")}</h3>
                      <p className="text-muted-foreground max-w-xs">{t("base64.noPreviewDesc")}</p>
                    </Card>
                  )}
                </div>
              </Tabs.Panel>

              <Tabs.Panel id="inspector">
                <Card className="p-0 overflow-hidden shadow-xl border-divider h-[400px] sm:h-[600px] flex flex-col">
                  <div className="p-4 border-b border-divider bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="size-4 text-primary" />
                      <span className="text-xs font-black uppercase tracking-widest">{t("base64.byteAnalysis")}</span>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-primary" /><span className="text-xs font-black uppercase opacity-60">{t("base64.hexLabel")}</span></div>
                      <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-secondary" /><span className="text-xs font-black uppercase opacity-60">{t("base64.binLabel")}</span></div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <DataTable
                      columns={byteColumns}
                      data={byteData}
                      filterField="hex"
                      renderCell={renderByteCell}
                      initialVisibleColumns={["offset", "hex", "binary", "decimal"]}
                      emptyContent={t("base64.processContent")}
                    />
                  </div>
                </Card>
              </Tabs.Panel>

              <Tabs.Panel id="batch">
                <Card className="p-0 overflow-hidden shadow-xl border-divider h-[400px] sm:h-[600px] flex flex-col">
                  <div className="p-4 border-b border-divider bg-muted/20 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest opacity-40">{t("base64.batchTitle")}</span>
                    <span className="text-xs font-mono opacity-30">{t("base64.batchHint")}</span>
                  </div>
                  <div className="p-4 space-y-4 flex-1 overflow-auto">
                    <TextArea
                      value={batchInput}
                      onChange={(e) => setBatchInput(e.target.value)}
                      placeholder={t("base64.batchPlaceholder")}
                      className="h-32 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-xs focus:ring-2 focus:ring-primary/20 shadow-inner"
                      aria-label={t("base64.batchPlaceholder")}
                    />
                    <Button
                      onPress={processBatch}
                      isDisabled={!batchInput.trim()}
                      variant="primary"
                      className="w-full font-bold"
                    >
                      {mode === "encode" ? t("base64.batchEncode") : t("base64.batchDecode")}
                    </Button>
                    {batchResults.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex gap-3 text-xs font-bold">
                          <span className="text-emerald-600 dark:text-emerald-400">{batchResults.filter(r => r.status === "success").length} {t("base64.batchSuccess")}</span>
                          <span className="text-red-600 dark:text-red-400">{batchResults.filter(r => r.status === "error").length} {t("base64.batchErrors")}</span>
                        </div>
                        <div className="space-y-1.5 max-h-[300px] overflow-auto">
                          {batchResults.map((item, i) => (
                            <div key={i} className={cn("p-3 rounded-xl border text-xs font-mono", item.status === "success" ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5")}>
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-muted-foreground truncate max-w-[200px]">{item.input}</span>
                                <CopyButton text={item.output} size="sm" variant="ghost" />
                              </div>
                              {item.status === "success" ? (
                                <p className="mt-1 text-emerald-700 dark:text-emerald-300 break-all">{item.output}</p>
                              ) : (
                                <p className="mt-1 text-red-600 dark:text-red-400">{item.error && t(`base64.error.${item.error}`) !== `base64.error.${item.error}` ? t(`base64.error.${item.error}`) : item.error}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </Tabs.Panel>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
