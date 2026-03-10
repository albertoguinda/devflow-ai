"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocaleStore } from "@/lib/stores/locale-store";
import enDict from "@/locales/en.json";

// English always loaded synchronously — SSR-safe fallback
const en: Record<string, string> = enDict as Record<string, string>;

// Module-level cache for dynamically loaded locales
const localeCache: Record<string, Record<string, string>> = { en };

// Dynamic importers — each locale becomes a separate chunk (~90KB each)
// Only the active locale is loaded, saving ~600KB vs static imports
const loaders: Record<string, (() => Promise<{ default: Record<string, string> }>) | undefined> = {
  es: () => import("@/locales/es.json") as Promise<{ default: Record<string, string> }>,
  fr: () => import("@/locales/fr.json") as Promise<{ default: Record<string, string> }>,
  pt: () => import("@/locales/pt.json") as Promise<{ default: Record<string, string> }>,
  de: () => import("@/locales/de.json") as Promise<{ default: Record<string, string> }>,
  it: () => import("@/locales/it.json") as Promise<{ default: Record<string, string> }>,
  zh: () => import("@/locales/zh.json") as Promise<{ default: Record<string, string> }>,
  ja: () => import("@/locales/ja.json") as Promise<{ default: Record<string, string> }>,
};

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const [dict, setDict] = useState<Record<string, string>>(() => localeCache[locale] ?? en);

  useEffect(() => {
    const cached = localeCache[locale];
    if (cached) {
      setDict(cached);
      return;
    }
    const load = loaders[locale];
    if (load) {
      load().then((mod) => {
        localeCache[locale] = mod.default;
        setDict(mod.default);
      });
    }
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = dict[key] ?? en[key] ?? key;

      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{${k}}`, String(v));
        }
      }

      return value;
    },
    [dict],
  );

  return { t, locale };
}
