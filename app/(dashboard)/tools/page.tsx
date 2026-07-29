"use client";

import { useState, useMemo } from "react";
import { SearchField } from "@heroui/react";
import { ToolCard } from "@/components/tools";
import { MagicInput } from "@/components/tools/magic-input";
import { TOOLS_DATA } from "@/config/tools-data";
import { useTranslation } from "@/hooks/use-translation";
import { ToolHeader } from "@/components/shared/tool-header";
import { Button } from "@/components/ui";
import { safeJsonLd } from "@/lib/json-ld";
import type { ToolCategory } from "@/types/tools";

const SITE_URL = "https://devflowai.dev";

const TOOLS_ITEM_LIST_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "DevFlowAI Developer Tools",
  description: "Free, open-source browser-based developer tools",
  numberOfItems: TOOLS_DATA.length,
  itemListElement: TOOLS_DATA.map((tool, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: tool.name,
    url: `${SITE_URL}/tools/${tool.slug}`,
  })),
};

export default function ToolsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ToolCategory | "all">("all");
  const { t } = useTranslation();

  // Derived from the registry, not hand-listed: the hardcoded list had gone
  // stale and omitted "generation" (7 tools) and "formatting" (3), so half the
  // catalogue was unreachable through the filter. Deriving it means a new
  // category shows up the moment a tool declares it.
  const CATEGORIES: { label: string; value: ToolCategory | "all" }[] = useMemo(
    () => [
      { label: t("tools.all"), value: "all" as const },
      ...[...new Set(TOOLS_DATA.map((tool) => tool.category))].map((value) => ({
        label: t(`tools.${value}`),
        value,
      })),
    ],
    [t],
  );

  const filteredTools = useMemo(() => {
    return TOOLS_DATA.filter((tool) => {
      const q = search.toLowerCase();
      const translatedName = t(`tool.${tool.slug}.name`).toLowerCase();
      const translatedDesc = t(`tool.${tool.slug}.description`).toLowerCase();
      const matchesSearch =
        translatedName.includes(q) ||
        translatedDesc.includes(q);
      const matchesCategory = category === "all" || tool.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category, t]);

  return (
    <div className="space-y-8">
      {/* Catalogue entity — belongs to the hub only, not to every tool page. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(TOOLS_ITEM_LIST_JSON_LD) }}
      />

      {/* Header */}
      <div className="relative -mx-4 -mt-4 md:-mx-8 md:-mt-8 mb-4 overflow-hidden rounded-b-2xl bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20 px-4 py-8 md:px-8">
        <div className="absolute -top-20 -right-20 size-60 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-400/10 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <ToolHeader
            title={t("tools.title")}
            description={t("tools.subtitle")}
          />
        </div>
      </div>

      {/* Magic Input */}
      <div className="mx-auto max-w-2xl">
        <MagicInput />
      </div>

      {/* Search + Filters */}
      <div className="space-y-4">
        <div className="max-w-md">
          <SearchField
            value={search}
            onChange={setSearch}
            aria-label={t("tools.search")}
          >
            <SearchField.Input placeholder={t("tools.search")} />
          </SearchField>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("tools.filterByCategory")}>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              size="sm"
              aria-pressed={category === cat.value}
              variant={category === cat.value ? "primary" : "ghost"}
              onPress={() => setCategory(cat.value)}
              className="rounded-full"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">{t("tools.noResults")}</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            {t("tools.noResultsHint")}
          </p>
        </div>
      )}
    </div>
  );
}
