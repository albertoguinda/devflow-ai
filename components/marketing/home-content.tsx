"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Zap, Monitor, LockOpen, Star, Github, Linkedin, Heart, ArrowRight } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { GsapReveal } from "@/components/marketing/gsap-reveal";
import { cn } from "@/lib/utils";

// Lazy load FeaturesSection — below the fold, splits TOOLS_DATA + TOOL_ICON_MAP into separate chunk
const FeaturesSection = dynamic(
  () => import("@/components/marketing/features-section").then((m) => ({ default: m.FeaturesSection })),
);

interface HomeContentProps {
  stars: number | null;
}

export function HomeContent({ stars }: HomeContentProps) {
  const { t } = useTranslation();

  const stats = [
    { label: t("home.freeTools"), value: "20", icon: <Zap className="size-6" aria-hidden="true" />, color: "from-amber-500 to-orange-500", glow: "group-hover:shadow-amber-500/20" },
    { label: t("home.openSource"), value: "100%", icon: <Monitor className="size-6" aria-hidden="true" />, color: "from-blue-500 to-indigo-500", glow: "group-hover:shadow-blue-500/20" },
    { label: t("home.noApiKey"), value: "0", icon: <LockOpen className="size-6" aria-hidden="true" />, color: "from-emerald-500 to-teal-500", glow: "group-hover:shadow-emerald-500/20" },
    { label: t("home.githubStars"), value: null, icon: <Star className="size-6" aria-hidden="true" />, color: "from-purple-500 to-pink-500", glow: "group-hover:shadow-purple-500/20" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Multi-layer gradient background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.25),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(236,72,153,0.08),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(236,72,153,0.05),transparent)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_20%_80%,rgba(16,185,129,0.06),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_20%_80%,rgba(16,185,129,0.04),transparent)]" />

        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <h1 className="text-5xl font-bold leading-tight text-foreground md:text-7xl">
              {t("home.title1")}
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-gradient-text">
                {t("home.title2")}
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground">
              {t("home.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/tools"
                className="inline-flex h-12 w-full sm:w-auto sm:min-w-[200px] cursor-pointer items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                {t("home.getStarted")}
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link
                href="https://github.com/albertoguinda/devflow-ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("home.starGithub")} (GitHub)`}
                className="inline-flex h-12 w-full sm:w-auto sm:min-w-[200px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background px-8 text-base font-semibold text-foreground transition-all hover:bg-muted hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Github className="size-5" aria-hidden="true" />
                {t("home.starGithub")}
                {stars !== null && (
                  <span className="ml-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                    {stars.toLocaleString()}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <GsapReveal className="container mx-auto px-4 py-10">
        <h2 className="sr-only">{t("home.statsLabel")}</h2>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-xl bg-muted/50 p-4 sm:p-6 text-center border border-border/40 transition-all duration-300 card-glow-border",
                "hover:-translate-y-1 hover:shadow-[0_0_30px_-5px]",
                stat.glow
              )}
            >
              {/* Colored top accent */}
              <div className={cn("absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r transition-all duration-300 group-hover:h-1", stat.color)} />
              <div className={cn("mb-3 mx-auto flex size-10 items-center justify-center rounded-lg bg-gradient-to-br text-white transition-transform duration-300 group-hover:scale-110", stat.color)}>
                {stat.icon}
              </div>
              <span className="block h-9 text-2xl sm:text-3xl font-bold text-foreground">
                {stat.value ?? (stars !== null ? stars.toLocaleString() : "\u2014")}
              </span>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </GsapReveal>

      {/* Features Section */}
      <FeaturesSection />

      {/* Community CTA Section */}
      <GsapReveal className="container mx-auto px-4 py-16">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-pink-950/30 p-8 sm:p-12 text-center">
          {/* Decorative gradient blob */}
          <div className="absolute -top-24 -right-24 size-64 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-400/10 blur-3xl" aria-hidden="true" />

          <div className="relative">
            <div className="mb-4 flex justify-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-purple-500/20">
                <Heart className="size-7 text-white" aria-hidden="true" />
              </div>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("home.communityTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
              {t("home.communitySubtitle")}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="https://github.com/albertoguinda/devflow-ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("home.starGithub")} — DevFlowAI`}
                className="inline-flex h-12 w-full sm:w-auto sm:min-w-[200px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-gray-800 to-gray-950 dark:from-gray-100 dark:to-gray-300 px-6 text-base font-semibold text-white dark:text-gray-900 shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                <Github className="size-5" aria-hidden="true" />
                {t("home.starGithub")}
              </Link>
              <Link
                href="https://github.com/albertoguinda/devflow-ai/issues/new?labels=tool-request&title=New+tool+idea"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("home.contributeTools")}
                className="inline-flex h-12 w-full sm:w-auto sm:min-w-[200px] items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-base font-semibold text-foreground transition-all hover:bg-muted hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-md"
              >
                <Zap className="size-5" aria-hidden="true" />
                {t("home.contributeTools")}
              </Link>
              <Link
                href="https://www.linkedin.com/in/albertoguindasevilla/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("home.followLinkedin")}
                className="inline-flex h-12 w-full sm:w-auto sm:min-w-[200px] items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-base font-semibold text-foreground transition-all hover:bg-muted hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-md"
              >
                <Linkedin className="size-5" aria-hidden="true" />
                {t("home.followLinkedin")}
              </Link>
            </div>
          </div>
        </div>
      </GsapReveal>

      {/* Footer */}
      <footer className="relative mt-auto border-t py-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; 2026 DevFlow AI &middot;{" "}
            <Link
              href="https://www.linkedin.com/in/albertoguindasevilla/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Alberto Guinda
            </Link>
            {" "}&middot; {t("home.footerFreeOS")} &middot;{" "}
            <Link
              href="https://github.com/albertoguinda/devflow-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              GitHub
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
