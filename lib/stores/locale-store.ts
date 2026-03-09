import { create } from "zustand";
import { persist } from "zustand/middleware";

type Locale = "en" | "es" | "fr" | "pt" | "de" | "it" | "zh" | "ja";

const SUPPORTED_LOCALES: Locale[] = ["en", "es", "fr", "pt", "de", "it", "zh", "ja"];

function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language.slice(0, 2).toLowerCase();
  return SUPPORTED_LOCALES.includes(lang as Locale) ? (lang as Locale) : "en";
}

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: detectBrowserLocale(),
      setLocale: (locale) => {
        if (typeof document !== "undefined") {
          const secure = window.location.protocol === "https:" ? ";Secure" : "";
          document.cookie = `devflow-locale=${locale};path=/;max-age=31536000;SameSite=Lax${secure}`;
        }
        set({ locale });
      },
    }),
    {
      name: "devflow-locale",
    },
  ),
);
