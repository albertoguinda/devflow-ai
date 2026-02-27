"use client";

import { useCallback } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { useToolRecommendations } from "@/hooks/use-tool-recommendations";
import { useTranslation } from "@/hooks/use-translation";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import type { ToolRoute } from "@/hooks/use-smart-navigation";

interface ToolSuggestionsProps {
  toolId: string;
  input: string;
  output: string;
}

export function ToolSuggestions({ toolId, input, output }: ToolSuggestionsProps) {
  const recommendations = useToolRecommendations(toolId, input, output);
  const { navigateTo } = useSmartNavigation();
  const { t } = useTranslation();

  const handleNavigate = useCallback((slug: string, data?: string) => {
    navigateTo(slug as ToolRoute, data);
  }, [navigateTo]);

  if (recommendations.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/10 bg-primary/5 px-3 py-2">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="size-3" aria-hidden="true" />
        {t("tools.suggestions")}
      </span>
      {recommendations.map((rec) => (
        <Button
          key={rec.toolSlug}
          size="sm"
          variant="ghost"
          className="gap-1.5 text-xs"
          onPress={() => handleNavigate(rec.toolSlug, rec.dataToPass)}
        >
          {rec.toolName}
          <ArrowRight className="size-3" aria-hidden="true" />
        </Button>
      ))}
    </div>
  );
}
