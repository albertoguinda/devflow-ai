"use client";

import { useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import { HeroUIProvider } from "@heroui/system";
import { SWRConfig } from "swr";
import { FavoritesProvider } from "@/lib/context";
import { ToastProvider } from "@/components/shared/toast-container";
import { useLocaleStore } from "@/lib/stores/locale-store";
const CommandPalette = dynamic(
  () => import("@/components/shared/command-palette").then((m) => m.CommandPalette),
  { ssr: false },
);

const InstallPrompt = dynamic(
  () => import("@/components/shared/install-prompt").then((m) => m.InstallPrompt),
  { ssr: false },
);

function HtmlLangSync() {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}

function ConsoleEasterEgg() {
  useEffect(() => {
    // console.info is excluded from removeConsole in next.config.ts
    try {
      console.info(
        "\n%c  DevFlow AI  %c  PARA VOSOTROS, DEVELOPERS  \n",
        "background:linear-gradient(135deg,#2563eb,#6366f1);color:#fff;font-size:22px;font-weight:900;padding:12px 20px;border-radius:8px 0 0 8px;letter-spacing:0.5px;text-shadow:0 1px 2px rgba(0,0,0,0.3);",
        "background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-size:22px;font-weight:900;padding:12px 20px;border-radius:0 8px 8px 0;letter-spacing:0.5px;text-shadow:0 1px 2px rgba(0,0,0,0.3);",
      );
      console.info(
        "%c  20 free tools  %c  No login  %c  Open Source  %c  8 languages  ",
        "background:#0ea5e9;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:4px;margin:2px;",
        "background:#10b981;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:4px;margin:2px;",
        "background:#f59e0b;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:4px;margin:2px;",
        "background:#8b5cf6;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:4px;margin:2px;",
      );
      console.info(
        "\n%c\u2605 Star us on GitHub%c\nhttps://github.com/albertoguinda/devflow-ai\n",
        "color:#facc15;font-size:14px;font-weight:bold;",
        "color:#60a5fa;font-size:12px;text-decoration:underline;",
      );
      console.info(
        "%c\ud83d\udc64 Alberto Guinda%c\nhttps://linkedin.com/in/albertoguindasevilla\n",
        "color:#0ea5e9;font-size:14px;font-weight:bold;",
        "color:#60a5fa;font-size:12px;text-decoration:underline;",
      );
      console.info(
        "%cWant to contribute? Open an issue \u2192 https://github.com/albertoguinda/devflow-ai/issues\n",
        "color:#a78bfa;font-size:12px;",
      );
    } catch {
      // Silently ignore console errors in restrictive environments
    }
  }, []);

  return null;
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <HeroUIProvider>
        <SWRConfig value={{ revalidateOnFocus: false, errorRetryCount: 2 }}>
          <FavoritesProvider>
            <ToastProvider>
              <HtmlLangSync />
              <ConsoleEasterEgg />
              <CommandPalette />
              <InstallPrompt />
              {children}
            </ToastProvider>
          </FavoritesProvider>
        </SWRConfig>
      </HeroUIProvider>
    </ThemeProvider>
  );
}
