"use client";

import { useState, useMemo } from "react";
import NextLink from "next/link";
import {
  ExternalLink,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { Card, Button, SearchField } from "@heroui/react";
import { TOOLS_DATA } from "@/config/tools-data";
import { TOOL_ICON_MAP } from "@/config/tool-icon-map";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { cn } from "@/lib/utils";
import type { ToolCategory } from "@/types/tools";

const CATEGORY_COLORS: Record<ToolCategory, string> = {
  analysis: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  review: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  calculation: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  visualization: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  management: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  generation: "bg-green-500/10 text-green-600 dark:text-green-400",
  formatting: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
};

export default function DocsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ToolCategory | "all">("all");
  const { t } = useTranslation();

  const CATEGORIES: { label: string; value: ToolCategory | "all" }[] = [
    { label: t("common.all"), value: "all" },
    { label: t("tools.analysis"), value: "analysis" },
    { label: t("tools.review"), value: "review" },
    { label: t("tools.calculation"), value: "calculation" },
    { label: t("tools.visualization"), value: "visualization" },
    { label: t("tools.management"), value: "management" },
    { label: t("tools.generation"), value: "generation" },
    { label: t("tools.formatting"), value: "formatting" },
  ];

  const filteredTools = useMemo(() => {
    return TOOLS_DATA.filter((tool) => {
      const q = search.toLowerCase();
      const translatedName = t(`tool.${tool.slug}.name`).toLowerCase();
      const translatedDesc = t(`tool.${tool.slug}.description`).toLowerCase();
      const translatedLong = t(`tool.${tool.slug}.longDescription`).toLowerCase();
      const matchesSearch =
        translatedName.includes(q) ||
        translatedDesc.includes(q) ||
        translatedLong.includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchesCategory = category === "all" || tool.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category, t]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <ToolHeader
        title={t("docs.title")}
        description={t("docs.subtitle")}
      />

      {/* Search + Filters */}
      <div className="space-y-4">
        <SearchField
          name="docs-search"
          value={search}
          onChange={setSearch}
          aria-label={t("docs.search")}
          className="max-w-md"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder={t("docs.search")} className="w-full" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={category === cat.value ? "primary" : "ghost"}
              size="sm"
              onPress={() => setCategory(cat.value)}
              className="rounded-full"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tool count */}
      <p className="text-sm text-muted-foreground">
        {t("docs.showing", { count: String(filteredTools.length), total: String(TOOLS_DATA.length) })}
      </p>

      {/* Tool Documentation Cards */}
      <div className="space-y-4">
        {filteredTools.map((tool) => {
          const IconComponent = TOOL_ICON_MAP[tool.icon];
          return (
            <Card
              key={tool.id}
              id={tool.slug}
              className="group relative cursor-pointer overflow-hidden border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 card-glow-border"
            >
              {/* Colored top bar */}
              <div className={cn("h-1.5 bg-gradient-to-r transition-all duration-300 group-hover:h-2", tool.color)} />

              <div className="p-5">
                {/* Header: Icon + Title + Open button */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {IconComponent && (
                      <div className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110",
                        tool.color
                      )}>
                        <IconComponent className="size-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-foreground truncate">
                        {t(`tool.${tool.slug}.name`)}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {t(`tool.${tool.slug}.description`)}
                      </p>
                    </div>
                  </div>
                  <NextLink
                    href={`/tools/${tool.slug}`}
                    className="relative z-10 flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-all hover:bg-muted hover:border-foreground/30"
                  >
                    {t("docs.openTool")}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </NextLink>
                </div>

                {/* Long Description */}
                <p className="text-sm leading-relaxed text-foreground/80 mb-3">
                  {t(`tool.${tool.slug}.longDescription`)}
                </p>

                {/* Features */}
                <div className="mb-3">
                  <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" />
                    {t("common.features")}
                  </h3>
                  <ul className="grid gap-1 sm:grid-cols-2">
                    {tool.features.map((_, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary/60" aria-hidden="true" />
                        {t(`tool.${tool.slug}.feature.${String(idx)}`)}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags + Category */}
                <div className="flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-3">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      CATEGORY_COLORS[tool.category]
                    )}
                  >
                    {t(`tools.${tool.category}`)}
                  </span>
                  {tool.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      <Tag className="size-2.5" aria-hidden="true" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Full card clickable overlay */}
              <NextLink
                href={`/tools/${tool.slug}`}
                className="absolute inset-0 z-0"
                aria-label={t(`tool.${tool.slug}.name`)}
              />
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredTools.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">{t("docs.noResults")}</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            {t("docs.noResultsHint")}
          </p>
        </div>
      )}
    </div>
  );
}
