import { create } from "zustand";
import { persist } from "zustand/middleware";

type Locale = "en" | "es" | "fr" | "pt" | "de" | "it" | "zh" | "ja";

const SUPPORTED_LOCALES: Locale[] = ["en", "es", "fr", "pt", "de", "it", "zh", "ja"];

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en" as Locale, // SSR-safe default — real locale hydrated after mount
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
      skipHydration: true, // Prevent sync rehydration before React hydration
    },
  ),
);

/** Call once after mount to rehydrate locale from localStorage or detect browser language */
export function hydrateLocale() {
  const hasStored = typeof localStorage !== "undefined" && localStorage.getItem("devflow-locale") !== null;
  useLocaleStore.persist.rehydrate();
  if (!hasStored) {
    // First visit — detect browser locale
    if (typeof navigator !== "undefined") {
      const lang = navigator.language.slice(0, 2).toLowerCase();
      if (SUPPORTED_LOCALES.includes(lang as Locale) && lang !== "en") {
        useLocaleStore.getState().setLocale(lang as Locale);
      }
    }
  }
}
