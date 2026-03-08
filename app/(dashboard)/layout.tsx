"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import Image from "next/image";
import Script from "next/script";
import type { ReactNode } from "react";
import {
  Wrench,
  Heart,
  Clock,
  Settings,
  Menu,
  X,
  BookOpen,
  Wand2,
  Github,
  ExternalLink,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslation } from "@/hooks/use-translation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { Button } from "@/components/ui";

const ApiKeyGuide = dynamic(
  () => import("@/components/shared/api-key-guide").then((m) => m.ApiKeyGuide),
  { ssr: false },
);
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Close sidebar on route change
  useEffect(() => {
    closeSidebar(); // eslint-disable-line react-hooks/set-state-in-effect -- intentional: sync sidebar with route
  }, [pathname, closeSidebar]);

  // Close sidebar on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && sidebarOpen) {
        closeSidebar();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, closeSidebar]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const NAV_ITEMS = useMemo(() => [
    { href: "/tools", label: t("sidebar.tools"), icon: Wrench },
    { href: "/docs", label: t("sidebar.docs"), icon: BookOpen },
    { href: "/favorites", label: t("sidebar.favorites"), icon: Heart },
    { href: "/history", label: t("sidebar.history"), icon: Clock },
    { href: "/settings", label: t("sidebar.settings"), icon: Settings },
  ] as const, [t]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="border-b border-border p-6">
        <NextLink
          href="/"
          className="group flex items-center gap-2.5 text-xl font-bold text-foreground"
        >
          <Image src="/icons/icon-192x192.png" alt="DevFlow AI" width={24} height={24} className="rounded-md transition-transform duration-300 group-hover:scale-110" />
          <span className="bg-gradient-to-r from-foreground to-foreground bg-clip-text transition-all duration-300 group-hover:from-blue-600 group-hover:via-indigo-600 group-hover:to-purple-600 group-hover:text-transparent dark:group-hover:from-blue-400 dark:group-hover:via-indigo-400 dark:group-hover:to-purple-400">DevFlow AI</span>
        </NextLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4" aria-label={t("sidebar.navLabel")}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <NextLink
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-l-3 border-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </NextLink>
          );
        })}
      </nav>

      {/* Setup AI */}
      <div className="px-4 pb-2">
        <Button
          variant="ghost"
          onPress={() => setGuideOpen(true)}
          className="flex w-full items-center gap-3 rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 h-auto justify-start"
        >
          <Wand2 className="size-5" />
          {t("guide.ai.setupAI")}
        </Button>
      </div>

      {/* Community */}
      <div className="border-t border-border px-4 pt-3 pb-1 space-y-1">
        <a
          href="https://github.com/albertoguinda/devflow-ai"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t("sidebar.starGithub")} (GitHub)`}
          className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Github className="size-4" aria-hidden="true" />
          {t("sidebar.starGithub")}
          <ExternalLink className="ml-auto size-3 opacity-50" aria-hidden="true" />
        </a>
        <a
          href="https://github.com/albertoguinda/devflow-ai/issues/new?labels=tool-request&title=New+tool+idea"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t("sidebar.contribute")} (GitHub)`}
          className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Heart className="size-4" aria-hidden="true" />
          {t("sidebar.contribute")}
          <ExternalLink className="ml-auto size-3 opacity-50" aria-hidden="true" />
        </a>
      </div>

      {/* Footer */}
      <div className="space-y-1 border-t border-border p-4">
        <LocaleToggle variant="full" />
        <ThemeToggle variant="full" />
        <p className="px-4 text-xs text-muted-foreground">
          {t("sidebar.freeOpenSource")}
        </p>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar — sticky */}
      <aside
        className="sticky top-0 hidden h-screen w-64 flex-col overflow-y-auto border-r border-border/50 bg-card/80 backdrop-blur-xl md:flex"
        aria-label={t("sidebar.sidebarLabel")}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card/95 backdrop-blur-xl transition-transform duration-300 ease-in-out md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label={t("sidebar.sidebarLabel")}
      >
        {/* Close button */}
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          onPress={closeSidebar}
          className="absolute right-3 top-5"
          aria-label={t("sidebar.closeSidebar")}
        >
          <X className="size-5" />
        </Button>
        {sidebarContent}
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="flex items-center gap-3 border-b border-border/50 bg-card/80 backdrop-blur-xl px-4 py-3 md:hidden">
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            onPress={() => setSidebarOpen(true)}
            aria-expanded={sidebarOpen}
            aria-controls="mobile-sidebar"
            aria-label={t("sidebar.openSidebar")}
          >
            <Menu className="size-5" />
          </Button>
          <NextLink
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-foreground"
          >
            <Image src="/icons/icon-192x192.png" alt="DevFlow AI" width={20} height={20} className="rounded-md" />
            <span>DevFlow AI</span>
          </NextLink>
        </header>

        {/* Main Content */}
        <main id="main-content" className="flex-1 overflow-auto scroll-pt-4 bg-background bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.03),transparent)] p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* API Key Guide Modal */}
      <ApiKeyGuide open={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Speculation Rules — prefetch tool pages for instant navigation (Chromium only) */}
      <Script id="speculation-rules" type="speculationrules" strategy="afterInteractive">
        {JSON.stringify({
          prefetch: [
            { source: "document", where: { href_matches: "/tools/*" } },
          ],
          prerender: [
            {
              source: "list",
              urls: [
                "/tools/json-formatter",
                "/tools/regex-humanizer",
                "/tools/uuid-generator",
              ],
            },
          ],
        })}
      </Script>
    </div>
  );
}
