"use client";

import { Card } from "@heroui/react";
import { useFadeIn, useStaggerIn } from "@/hooks/use-gsap";
import { Github, Linkedin, Mail, Code2, Heart, Zap } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function AboutPage() {
  const headerRef = useFadeIn();
  const cardsRef = useStaggerIn("> *", 0.15);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section
        ref={headerRef}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.08),transparent)]" />
        <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="mb-4 text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">{t("about.title")}</h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {t("about.description")}
          </p>
        </div>
      </section>

      {/* Mission Cards */}
      <section ref={cardsRef} className="container mx-auto px-4 pb-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          <Card className="group relative overflow-hidden border border-border/50 p-8 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg card-glow-border">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:h-1.5" />
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg">
              <Code2 className="size-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{t("about.builtForDevs")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("about.builtForDevsDesc")}
            </p>
          </Card>
          <Card className="group relative overflow-hidden border border-border/50 p-8 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg card-glow-border">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 group-hover:h-1.5" />
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg">
              <Heart className="size-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{t("about.openTransparent")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("about.openTransparentDesc")}
            </p>
          </Card>
          <Card className="group relative overflow-hidden border border-border/50 p-8 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg card-glow-border">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 group-hover:h-1.5" />
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg">
              <Zap className="size-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{t("about.speedFirst")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("about.speedFirstDesc")}
            </p>
          </Card>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative border-t border-border bg-muted/30 py-16 overflow-hidden">
        <div className="absolute top-10 -left-32 size-80 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-10 -right-32 size-80 rounded-full bg-gradient-to-br from-pink-500/5 to-orange-500/5 blur-3xl" aria-hidden="true" />
        <div className="relative container mx-auto max-w-4xl px-4">
          <h2 className="mb-10 text-center text-3xl font-bold">{t("about.techStack")}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                name: "Next.js 16",
                category: t("about.techFramework"),
                gradient: "from-gray-600 to-gray-800 dark:from-gray-400 dark:to-gray-200",
              },
              {
                name: "React 19",
                category: t("about.techUI"),
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                name: "TypeScript 5.7",
                category: t("about.techLanguage"),
                gradient: "from-blue-600 to-indigo-600",
              },
              {
                name: "Tailwind v4",
                category: t("about.techStyling"),
                gradient: "from-cyan-500 to-teal-500",
              },
              {
                name: "HeroUI v3",
                category: t("about.techComponents"),
                gradient: "from-pink-500 to-rose-500",
              },
              {
                name: "Vitest",
                category: t("about.techTesting"),
                gradient: "from-emerald-500 to-green-500",
              },
              {
                name: "GSAP",
                category: t("about.techAnimations"),
                gradient: "from-amber-500 to-orange-500",
              },
              {
                name: "Zustand",
                category: t("about.techState"),
                gradient: "from-indigo-500 to-violet-500",
              },
            ].map((tech) => (
              <div
                key={tech.name}
                className="group rounded-xl border border-border/50 bg-card p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <p className={`font-semibold bg-gradient-to-r ${tech.gradient} bg-clip-text text-transparent`}>{tech.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {tech.category}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold">{t("about.connect")}</h2>
        <p className="mb-8 text-muted-foreground">
          {t("about.connectDesc")}
        </p>
        <div className="flex justify-center gap-5">
          <a
            href="https://github.com/albertoguinda/devflow-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-500 text-white dark:text-gray-900 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            aria-label={t("common.github")}
          >
            <Github className="size-6 transition-transform duration-300 group-hover:scale-110" />
          </a>
          <a
            href="https://www.linkedin.com/in/albertoguindasevilla/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30"
            aria-label={t("common.linkedin")}
          >
            <Linkedin className="size-6 transition-transform duration-300 group-hover:scale-110" />
          </a>
          <a
            href="mailto:contact@devflow.ai"
            className="group flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-md shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/30"
            aria-label={t("about.email")}
          >
            <Mail className="size-6 transition-transform duration-300 group-hover:scale-110" />
          </a>
        </div>
      </section>
    </div>
  );
}
