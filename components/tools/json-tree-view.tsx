"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import {
  buildJsonTree,
  collectPathsToDepth,
  collectAllPaths,
} from "@/lib/application/json-tree";
import type { JsonTreeNode } from "@/lib/application/json-tree";
import { Button } from "@/components/ui";

interface JsonTreeViewProps {
  data: unknown;
  defaultExpanded?: number; // How many levels to expand by default (default: 2)
}

// Color classes by JSON type — dark mode compatible
const TYPE_COLORS: Record<JsonTreeNode["type"], string> = {
  string: "text-emerald-600 dark:text-emerald-400",
  number: "text-blue-600 dark:text-blue-400",
  boolean: "text-violet-600 dark:text-violet-400",
  null: "text-muted-foreground italic",
  object: "",
  array: "",
};

const KEY_COLOR = "text-cyan-600 dark:text-cyan-400";

function formatValue(node: JsonTreeNode): string {
  switch (node.type) {
    case "string":
      return `"${String(node.value)}"`;
    case "null":
      return "null";
    case "boolean":
    case "number":
      return String(node.value);
    default:
      return "";
  }
}

function TreeNode({
  node,
  expanded,
  onToggle,
  isRoot,
  itemsLabel,
}: {
  node: JsonTreeNode;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  isRoot: boolean;
  itemsLabel: string;
}) {
  const isExpandable =
    (node.type === "object" || node.type === "array") &&
    node.children !== undefined;
  const isExpanded = expanded.has(node.path);
  const childCount = node.children?.length ?? 0;

  const openBracket = node.type === "array" ? "[" : "{";
  const closeBracket = node.type === "array" ? "]" : "}";
  const collapsedPreview = node.type === "array" ? "[...]" : "{...}";

  return (
    <div className="font-mono text-xs leading-relaxed">
      <div className="flex items-start gap-0.5 group/node">
        {/* Expand/Collapse chevron */}
        {isExpandable ? (
          <button
            type="button"
            onClick={() => onToggle(node.path)}
            className="shrink-0 mt-0.5 p-0.5 rounded hover:bg-muted/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label={isExpanded ? `Collapse ${node.key}` : `Expand ${node.key}`}
            aria-expanded={isExpanded}
          >
            <ChevronRight
              className={cn(
                "size-3.5 text-muted-foreground/60 transition-transform duration-150",
                isExpanded && "rotate-90"
              )}
            />
          </button>
        ) : (
          <span className="shrink-0 w-[18px]" />
        )}

        {/* Key name */}
        {!isRoot && (
          <span className={cn("font-bold", KEY_COLOR)}>
            {/^\d+$/.test(node.key) ? (
              <span className="text-muted-foreground/50">{node.key}</span>
            ) : (
              <>
                &quot;{node.key}&quot;
              </>
            )}
            <span className="text-muted-foreground/60">: </span>
          </span>
        )}

        {/* Value or bracket */}
        {isExpandable ? (
          <>
            {isExpanded ? (
              <span className="text-muted-foreground/60">{openBracket}</span>
            ) : (
              <button
                type="button"
                onClick={() => onToggle(node.path)}
                className="inline-flex items-center gap-1.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
              >
                <span>{collapsedPreview}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-muted/50 rounded-full font-bold text-muted-foreground/80">
                  {childCount} {itemsLabel}
                </span>
              </button>
            )}
          </>
        ) : (
          <span className={TYPE_COLORS[node.type]}>
            {formatValue(node)}
          </span>
        )}
      </div>

      {/* Children */}
      {isExpandable && isExpanded && (
        <div className="pl-4 border-l border-muted/30 ml-[8px]">
          {node.children!.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              expanded={expanded}
              onToggle={onToggle}
              isRoot={false}
              itemsLabel={itemsLabel}
            />
          ))}
          <div className="flex items-start gap-0.5">
            <span className="shrink-0 w-[18px]" />
            <span className="text-muted-foreground/60">{closeBracket}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function JsonTreeView({ data, defaultExpanded = 2 }: JsonTreeViewProps) {
  const { t } = useTranslation();

  const tree = useMemo(() => buildJsonTree(data), [data]);

  const defaultExpandedPaths = useMemo(() => {
    if (!tree) return new Set<string>();
    return collectPathsToDepth(tree, defaultExpanded);
  }, [tree, defaultExpanded]);

  const [expanded, setExpanded] = useState<Set<string>>(defaultExpandedPaths);

  const allPaths = useMemo(() => {
    if (!tree) return new Set<string>();
    return collectAllPaths(tree);
  }, [tree]);

  const handleToggle = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpanded(new Set(allPaths));
  }, [allPaths]);

  const collapseAll = useCallback(() => {
    setExpanded(new Set<string>());
  }, []);

  if (!tree) return null;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onPress={expandAll}
          className="text-xs font-bold"
          aria-label={t("jsonFmt.treeExpand")}
        >
          {t("jsonFmt.treeExpand")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onPress={collapseAll}
          className="text-xs font-bold"
          aria-label={t("jsonFmt.treeCollapse")}
        >
          {t("jsonFmt.treeCollapse")}
        </Button>
      </div>
      <div className="overflow-auto">
        <TreeNode
          node={tree}
          expanded={expanded}
          onToggle={handleToggle}
          isRoot={true}
          itemsLabel={t("jsonFmt.treeItems")}
        />
      </div>
    </div>
  );
}
