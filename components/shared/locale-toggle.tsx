"use client";

import { useEffect, useRef, useState } from "react";
import { useLocaleStore } from "@/lib/stores/locale-store";
import { useTranslation } from "@/hooks/use-translation";
import { Globe, Check } from "lucide-react";

type Locale = "en" | "es" | "fr" | "pt" | "de" | "it" | "zh" | "ja";

const LOCALE_CONFIG: Record<Locale, { flag: string; label: string; native: string }> = {
  en: { flag: "🇺🇸", label: "English", native: "English" },
  es: { flag: "🇪🇸", label: "Spanish", native: "Español" },
  fr: { flag: "🇫🇷", label: "French", native: "Français" },
  pt: { flag: "🇧🇷", label: "Portuguese", native: "Português" },
  de: { flag: "🇩🇪", label: "German", native: "Deutsch" },
  it: { flag: "🇮🇹", label: "Italian", native: "Italiano" },
  zh: { flag: "🇨🇳", label: "Chinese", native: "中文" },
  ja: { flag: "🇯🇵", label: "Japanese", native: "日本語" },
};

interface LocaleToggleProps {
  variant?: "icon" | "full";
}

/**
 * Self-contained accessible language switcher. Deliberately does NOT use HeroUI
 * v3 beta's Dropdown — that component fails to open its menu in this project, so
 * we roll a small button + popover we fully control (open state, click-outside,
 * Escape). Trigger and options are all plain buttons (no nested interactives).
 */
export function LocaleToggle({ variant = "icon" }: LocaleToggleProps) {
  const locale = useLocaleStore((s) => s.locale) as Locale;
  const setLocale = useLocaleStore((s) => s.setLocale);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = LOCALE_CONFIG[locale] ?? LOCALE_CONFIG.en;
  const label = t("sidebar.switchLocale");

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={
          variant === "full"
            ? "flex w-full items-center justify-start gap-3 rounded-md px-4 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
            : "inline-flex size-11 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
        }
      >
        {variant === "full" ? (
          <>
            <span className="text-lg" aria-hidden="true">
              {current.flag}
            </span>
            {current.native}
          </>
        ) : (
          <Globe className="size-5" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={label}
          className="absolute right-0 z-50 mt-2 max-h-80 min-w-52 overflow-auto rounded-lg border border-border bg-background p-1 shadow-lg"
        >
          {(Object.entries(LOCALE_CONFIG) as [Locale, (typeof LOCALE_CONFIG)["en"]][]).map(
            ([key, cfg]) => {
              const active = key === locale;
              return (
                <button
                  key={key}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    setLocale(key);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span className="text-lg" aria-hidden="true">
                    {cfg.flag}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-medium text-foreground">{cfg.native}</span>
                    <span className="text-xs text-muted-foreground">{cfg.label}</span>
                  </span>
                  {active && <Check className="ml-auto size-4 text-primary" aria-hidden="true" />}
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}
