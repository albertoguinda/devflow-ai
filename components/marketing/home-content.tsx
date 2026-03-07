"use client";

import Link from "next/link";
import { Zap, Monitor, LockOpen, Star, Github, Linkedin, Heart, ArrowRight } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { GsapReveal } from "@/components/marketing/gsap-reveal";
import { FeaturesSection } from "@/components/marketing/features-section";

interface HomeContentProps {
  stars: number | null;
}

export function HomeContent({ stars }: HomeContentProps) {
  const { t } = useTranslation();

  const stats = [
    { label: t("home.freeTools"), value: "15", icon: <Zap className="size-6" aria-hidden="true" /> },
    { label: t("home.openSource"), value: "100%", icon: <Monitor className="size-6" aria-hidden="true" /> },
    { label: t("home.noApiKey"), value: "0", icon: <LockOpen className="size-6" aria-hidden="true" /> },
    { label: t("home.githubStars"), value: null, icon: <Star className="size-6" aria-hidden="true" /> },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(0,0,0,0))]" />

        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-900 dark:bg-blue-900/30 dark:text-blue-200">
              <Zap className="size-4" />
              {t("home.badge")}
            </span>

            <h1 className="text-5xl font-bold leading-tight text-foreground md:text-7xl">
              {t("home.title1")}
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                {t("home.title2")}
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {t("home.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/tools"
                className="inline-flex h-12 min-w-[200px] cursor-pointer items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:opacity-90"
              >
                {t("home.getStarted")}
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
              <Link
                href="https://github.com/albertoguinda/devflow-ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("home.starGithub")} (GitHub)`}
                className="inline-flex h-12 min-w-[200px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background px-8 text-base font-semibold text-foreground transition-colors hover:bg-muted"
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
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-muted/50 p-6 text-center"
            >
              <div className="mb-2 flex justify-center text-muted-foreground">{stat.icon}</div>
              <span className="block h-9 text-3xl font-bold text-foreground">
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
                className="inline-flex h-12 min-w-[200px] items-center justify-center gap-2 rounded-lg bg-foreground px-6 text-base font-semibold text-background transition-opacity hover:opacity-90"
              >
                <Github className="size-5" aria-hidden="true" />
                {t("home.starGithub")}
              </Link>
              <Link
                href="https://github.com/albertoguinda/devflow-ai/issues/new?labels=tool-request&title=New+tool+idea"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("home.contributeTools")}
                className="inline-flex h-12 min-w-[200px] items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Zap className="size-5" aria-hidden="true" />
                {t("home.contributeTools")}
              </Link>
              <Link
                href="https://www.linkedin.com/in/albertoguindasevilla/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("home.followLinkedin")}
                className="inline-flex h-12 min-w-[200px] items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Linkedin className="size-5" aria-hidden="true" />
                {t("home.followLinkedin")}
              </Link>
            </div>
          </div>
        </div>
      </GsapReveal>

      {/* Footer */}
      <footer className="mt-auto border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; 2026 DevFlow AI &middot;{" "}
            <Link
              href="https://www.linkedin.com/in/albertoguindasevilla/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Alberto Guinda
            </Link>
            {" "}&middot; {t("home.footerFreeOS")} &middot;{" "}
            <Link
              href="https://github.com/albertoguinda/devflow-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              GitHub
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
