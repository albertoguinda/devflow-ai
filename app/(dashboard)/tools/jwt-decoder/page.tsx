"use client";

import { useMemo, useCallback } from "react";
import { useShareState } from "@/hooks/use-share-state";
import { ShareButton } from "@/components/shared/share-button";
import {
  KeyRound,
  RotateCcw,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { TextArea } from "@heroui/react";
import { useJwtDecoder } from "@/hooks/use-jwt-decoder";
import { useTranslation } from "@/hooks/use-translation";
import { CopyButton } from "@/components/shared/copy-button";
import { ToolHeader } from "@/components/shared/tool-header";
import { ToolSuggestions } from "@/components/shared/tool-suggestions";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useToolShortcuts } from "@/hooks/use-tool-shortcuts";
import { KbdHint } from "@/components/shared/kbd-hint";

export default function JwtDecoderPage() {
  const { t } = useTranslation();
  const {
    token,
    parts,
    validation,
    claims,
    error,
    isDecoding,
    setToken,
    decode,
    reset,
  } = useJwtDecoder();

  const handleShareLoad = useCallback((state: Record<string, string>) => {
    if (state["token"]) setToken(state["token"]);
  }, [setToken]);

  const { share } = useShareState({ toolSlug: "jwt-decoder", onLoad: handleShareLoad });

  const getShareUrl = useCallback(() => {
    return share({ token });
  }, [share, token]);

  useToolShortcuts({
    onExecute: decode,
    onCopyOutput: () => {
      if (parts) {
        const payloadStr = JSON.stringify(parts.payload, null, 2);
        try { void navigator.clipboard.writeText(payloadStr); } catch { /* noop */ }
      }
    },
    onShare: getShareUrl,
    onClear: reset,
  });

  const canDecode = useMemo(() => token.trim().length > 0, [token]);

  const headerJson = useMemo(
    () => (parts ? JSON.stringify(parts.header, null, 2) : ""),
    [parts]
  );

  const payloadJson = useMemo(
    () => (parts ? JSON.stringify(parts.payload, null, 2) : ""),
    [parts]
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in-up">
      <ToolHeader
        title={t("jwt.title")}
        description={t("jwt.description")}
        icon={KeyRound}
        gradient="from-amber-500 to-yellow-600"
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

      {/* Token Input */}
      <Card>
        <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-amber-500 to-yellow-600" />
        <div className="p-4 md:p-6 space-y-4">
          <TextArea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={t("jwt.inputPlaceholder")}
            aria-label={t("jwt.inputLabel")}
            className="h-32 sm:h-40 w-full resize-none rounded-xl border border-divider bg-background p-4 font-mono text-xs focus:ring-2 focus:ring-primary/20 shadow-inner"
          />

          <Button
            onPress={decode}
            isDisabled={!canDecode}
            isLoading={isDecoding}
            variant="primary"
            className="btn-luxury w-full h-12 font-black bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 border-0 transition-all text-md"
          >
            <Unlock className="size-5 mr-2" aria-hidden="true" />
            {t("jwt.decode")} <KbdHint shortcut="⌘↵" className="ml-2" />
          </Button>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 text-sm text-red-800 dark:text-red-300 flex items-center gap-2" role="alert">
          <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Validation Status */}
      {validation && (
        <Card>
          <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-amber-500 to-yellow-600" />
          <div className="p-4 md:p-6 space-y-3">
            <div className="flex items-center gap-2">
              {validation.isValid ? (
                <ShieldCheck className="size-5 text-emerald-500" aria-hidden="true" />
              ) : (
                <ShieldAlert className="size-5 text-red-500" aria-hidden="true" />
              )}
              <h2 className="text-lg font-semibold text-foreground">{t("jwt.validation")}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Algorithm */}
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">{t("jwt.algorithm")}</p>
                <p className="text-sm font-semibold text-foreground">{validation.algorithm ?? t("jwt.unknown")}</p>
              </div>

              {/* Expiration */}
              <div className={cn(
                "rounded-lg p-3",
                validation.isExpired
                  ? "bg-red-50 dark:bg-red-950/50"
                  : "bg-muted/50"
              )}>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" aria-hidden="true" />
                  {t("jwt.expiration")}
                </p>
                <p className={cn(
                  "text-sm font-semibold",
                  validation.isExpired ? "text-red-600 dark:text-red-400" : "text-foreground"
                )}>
                  {validation.expiresAt
                    ? new Date(validation.expiresAt).toLocaleString()
                    : t("jwt.noExpiration")}
                </p>
                {validation.isExpired && (
                  <span className="text-xs text-red-500">{t("jwt.expired")}</span>
                )}
              </div>

              {/* Issuer */}
              {validation.issuer && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">{t("jwt.issuer")}</p>
                  <p className="text-sm font-semibold text-foreground">{validation.issuer}</p>
                </div>
              )}

              {/* Subject */}
              {validation.subject && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">{t("jwt.subject")}</p>
                  <p className="text-sm font-semibold text-foreground">{validation.subject}</p>
                </div>
              )}
            </div>

            {/* Errors */}
            {validation.errors.length > 0 && (
              <div className="space-y-1.5">
                {validation.errors.map((err, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                    {err}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Decoded Parts */}
      {parts && (
        <>
          {/* Header */}
          <Card>
            <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-blue-500 to-cyan-500" />
            <div className="p-4 md:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">{t("jwt.header")}</h2>
                <CopyButton text={headerJson} />
              </div>
              <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono text-foreground whitespace-pre-wrap">
                {headerJson}
              </pre>
            </div>
          </Card>

          {/* Payload */}
          <Card>
            <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div className="p-4 md:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">{t("jwt.payload")}</h2>
                <CopyButton text={payloadJson} />
              </div>
              <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono text-foreground whitespace-pre-wrap">
                {payloadJson}
              </pre>
            </div>
          </Card>

          {/* Claims */}
          {claims.length > 0 && (
            <Card>
              <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-violet-500 to-purple-500" />
              <div className="p-4 md:p-6 space-y-3">
                <h2 className="text-lg font-semibold text-foreground">{t("jwt.claims")}</h2>
                <div className="space-y-2">
                  {claims.map((claim) => (
                    <div key={claim.key} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                      <span className={cn(
                        "shrink-0 rounded px-2 py-0.5 text-xs font-bold min-w-[40px] text-center",
                        claim.type === "standard"
                          ? claim.status === "error"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : claim.status === "warning"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-muted text-muted-foreground backdrop-blur-sm border border-border/30"
                      )}>
                        {claim.key}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{claim.label}</p>
                        <code className="text-xs font-mono text-foreground break-all">
                          {typeof claim.value === "object"
                            ? JSON.stringify(claim.value)
                            : String(claim.value)}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Signature */}
          <Card>
            <div className="absolute inset-x-0 top-0 h-0.5 accent-glow bg-gradient-to-r from-rose-500 to-pink-500" />
            <div className="p-4 md:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">{t("jwt.signature")}</h2>
                <CopyButton text={parts.signature} />
              </div>
              <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono text-foreground break-all whitespace-pre-wrap">
                {parts.signature}
              </pre>
            </div>
          </Card>
        </>
      )}

      {/* Empty state */}
      {!parts && !error && (
        <div className="text-center text-muted-foreground py-8">
          <KeyRound className="size-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
          <p className="text-sm">{t("jwt.emptyState")}</p>
          <p className="text-xs mt-1 text-muted-foreground">{t("jwt.emptyStateHint")}</p>
        </div>
      )}

      {/* Cross-tool suggestions */}
      <ToolSuggestions toolId="jwt-decoder" input={token} output={payloadJson} />
    </div>
  );
}
