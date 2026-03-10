"use client";

import { useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import { HeroUIProvider } from "@heroui/system";
import { SWRConfig } from "swr";
import { FavoritesProvider } from "@/lib/context";
import { ToastProvider } from "@/components/shared/toast-container";
import { useLocaleStore, hydrateLocale } from "@/lib/stores/locale-store";
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
    hydrateLocale();
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}

function ConsoleEasterEgg() {
  useEffect(() => {
    // Defer to idle time — not critical for initial render
    const run = () => {
    // console.info is preserved by removeConsole in next.config.ts
    try {
      const h = "font-weight:900;letter-spacing:0.5px;text-shadow:0 2px 4px rgba(0,0,0,0.3);";

      // ── Banner ──
      console.info(
        "%c\n" +
        "    ____            ________ \n" +
        "   / __ \\___  _  __/ ____/ /___ _      __\n" +
        "  / / / / _ \\| |/ / /_  / / __ \\ | /| / /\n" +
        " / /_/ /  __/|   / __/ / / /_/ / |/ |/ / \n" +
        "/_____/\\___/ |_/_/   /_/\\____/|__/|__/  \n" +
        "                          A  I\n",
        "color:#818cf8;font-family:monospace;font-size:12px;line-height:1.2;",
      );

      // ── Title ──
      console.info(
        "\n%c  DevFlow AI  %c  v4.21.0  ",
        `background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;font-size:20px;padding:10px 18px;border-radius:8px 0 0 8px;${h}`,
        `background:#1e1b4b;color:#a5b4fc;font-size:12px;padding:14px 14px;border-radius:0 8px 8px 0;font-weight:700;`,
      );

      // ── Feature pills ──
      console.info(
        "\n%c 20 tools %c No login %c Open Source %c 8 languages ",
        "background:#0ea5e9;color:#fff;font-size:11px;font-weight:700;padding:5px 12px;border-radius:12px;margin:3px;",
        "background:#10b981;color:#fff;font-size:11px;font-weight:700;padding:5px 12px;border-radius:12px;margin:3px;",
        "background:#f59e0b;color:#fff;font-size:11px;font-weight:700;padding:5px 12px;border-radius:12px;margin:3px;",
        "background:#8b5cf6;color:#fff;font-size:11px;font-weight:700;padding:5px 12px;border-radius:12px;margin:3px;",
      );

      // ── Links ──
      console.info(
        "\n%c\u2605 GitHub%c  https://github.com/albertoguinda/devflow-ai" +
        "\n%c\u2139 Author%c  Alberto Guinda \u2014 https://linkedin.com/in/albertoguindasevilla" +
        "\n%c\u2764 Contribute%c  https://github.com/albertoguinda/devflow-ai/issues\n",
        "color:#facc15;font-weight:bold;font-size:12px;", "color:#94a3b8;font-size:12px;",
        "color:#60a5fa;font-weight:bold;font-size:12px;", "color:#94a3b8;font-size:12px;",
        "color:#f472b6;font-weight:bold;font-size:12px;", "color:#94a3b8;font-size:12px;",
      );
    } catch {
      // Silently ignore console errors in restrictive environments
    }
    };
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(run);
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(run, 2000);
    return () => clearTimeout(id);
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
