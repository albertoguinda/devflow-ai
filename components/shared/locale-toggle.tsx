"use client";

import { useLocaleStore } from "@/lib/stores/locale-store";
import { useTranslation } from "@/hooks/use-translation";
import { Dropdown, Label } from "@heroui/react";
import { Button } from "@/components/ui";
import { Globe } from "lucide-react";

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

export function LocaleToggle({ variant = "icon" }: LocaleToggleProps) {
  const locale = useLocaleStore((s) => s.locale) as Locale;
  const setLocale = useLocaleStore((s) => s.setLocale);
  const { t } = useTranslation();

  const current = LOCALE_CONFIG[locale] ?? LOCALE_CONFIG.en;

  return (
    <Dropdown>
      {variant === "full" ? (
        <Button
          variant="ghost"
          size="sm"
          className="gap-3 px-4 py-2.5 text-sm font-medium w-full justify-start"
          aria-label={t("sidebar.switchLocale")}
        >
          <span className="text-lg" aria-hidden="true">{current.flag}</span>
          {current.native}
        </Button>
      ) : (
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          aria-label={t("sidebar.switchLocale")}
        >
          <Globe className="size-5" />
        </Button>
      )}
      <Dropdown.Popover>
        <Dropdown.Menu
          selectionMode="single"
          selectedKeys={new Set([locale])}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as Locale;
            if (selected) setLocale(selected);
          }}
          aria-label={t("sidebar.switchLocale")}
        >
          {(Object.entries(LOCALE_CONFIG) as [Locale, typeof LOCALE_CONFIG.en][]).map(([key, cfg]) => (
            <Dropdown.Item key={key} id={key} textValue={cfg.native}>
              <Dropdown.ItemIndicator />
              <Label>
                <div className="flex items-center gap-3">
                  <span className="text-lg" aria-hidden="true">{cfg.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{cfg.native}</span>
                    <span className="text-xs text-muted-foreground">{cfg.label}</span>
                  </div>
                </div>
              </Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
