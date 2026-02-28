import { create } from "zustand";
import { persist } from "zustand/middleware";

type Locale = "en" | "es";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
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
