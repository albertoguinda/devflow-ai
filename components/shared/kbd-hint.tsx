"use client";

import { cn } from "@/lib/utils";

interface KbdHintProps {
  /** The shortcut to display, e.g. "⌘↵" or "Ctrl+Enter" */
  shortcut: string;
  /** Optional class name */
  className?: string;
}

export function KbdHint({ shortcut, className }: KbdHintProps) {
  return (
    <kbd
      className={cn(
        "hidden sm:inline-flex items-center gap-0.5 rounded border border-border/50 bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground",
        className,
      )}
    >
      {shortcut}
    </kbd>
  );
}
