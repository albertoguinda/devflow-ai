"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { HelpLink } from "./help-link";

interface ToolHeaderProps {
  /** Tool title */
  title: string;
  /** Short description */
  description: string;
  /** Lucide icon component (enables gradient icon box) */
  icon?: LucideIcon;
  /** Tailwind gradient classes, e.g. "from-indigo-500 to-blue-600" */
  gradient?: string;
  /** Optional action slot (buttons, toggles) rendered on the right */
  actions?: ReactNode;
  /** Show breadcrumb navigation (Tools > Current Page) */
  breadcrumb?: boolean;
}

export function ToolHeader({
  title,
  description,
  icon: Icon,
  gradient,
  actions,
  breadcrumb = false,
}: ToolHeaderProps) {
  const { t } = useTranslation();

  const breadcrumbNav = breadcrumb ? (
    <nav aria-label={t("common.breadcrumb")} className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Link href="/tools" className="transition-colors hover:text-foreground">
        {t("common.tools")}
      </Link>
      <ChevronRight className="size-3" />
      <span className="text-foreground/70">{title}</span>
    </nav>
  ) : null;

  const actionsWithHelp = (
    <div className="flex items-center gap-2">
      {actions}
      <HelpLink />
    </div>
  );

  if (Icon && gradient) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5 sm:p-6">
        {/* Decorative gradient glow */}
        <div className={cn("absolute -right-16 -top-16 size-48 rounded-full bg-gradient-to-br opacity-[0.07] blur-3xl dark:opacity-[0.12]", gradient)} />
        <div className={cn("absolute -left-8 -bottom-8 size-32 rounded-full bg-gradient-to-br opacity-[0.04] blur-2xl dark:opacity-[0.08]", gradient)} />

        <div className="relative">
          {breadcrumbNav}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div
                className={cn(
                  "flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-transform duration-300 ease-out hover:scale-105",
                  gradient
                )}
                style={{ boxShadow: "0 8px 24px -4px rgba(0,0,0,0.15)" }}
              >
                <Icon className="size-7 text-white drop-shadow-sm" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                  {title}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
              </div>
            </div>
            {actionsWithHelp}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {breadcrumbNav}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
        {actionsWithHelp}
      </div>
    </div>
  );
}
