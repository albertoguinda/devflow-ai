"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@heroui/react";
import { Check, Link2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  /** Function that returns the share URL (async) */
  getShareUrl: () => Promise<string | null>;
  /** Optional label shown next to the icon */
  label?: string;
  /** HeroUI Button variant */
  variant?: "ghost" | "outline" | "primary" | "secondary" | "tertiary";
  /** HeroUI Button size */
  size?: "sm" | "md" | "lg";
  /** Disable the button */
  isDisabled?: boolean;
  /** Extra class names */
  className?: string;
}

export function ShareButton({
  getShareUrl,
  label,
  variant = "ghost",
  size = "sm",
  isDisabled = false,
  className,
}: ShareButtonProps) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [shared, setShared] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleShare = useCallback(async () => {
    setIsSharing(true);

    try {
      const url = await getShareUrl();

      if (!url) {
        addToast(t("share.tooLong"), "warning");
        return;
      }

      // Try Web Share API first (mobile, progressive web apps)
      if (typeof navigator !== "undefined" && "share" in navigator) {
        try {
          await navigator.share({
            title: t("share.title"),
            text: t("share.text"),
            url,
          });
          setShared(true);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => setShared(false), 2000);
          return;
        } catch (err) {
          // User cancelled share dialog — fall through to clipboard
          if (err instanceof Error && err.name === "AbortError") return;
        }
      }

      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      addToast(t("share.copied"), "success");
      setShared(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShared(false), 2000);
    } finally {
      setIsSharing(false);
    }
  }, [getShareUrl, addToast, t]);

  const resolvedLabel = label ?? t("share.share");

  return (
    <Button
      variant={variant}
      size={size}
      isDisabled={isDisabled || isSharing}
      onPress={handleShare}
      className={cn(label ? undefined : "min-w-0 px-2", className)}
      aria-label={t("share.shareState")}
    >
      {shared ? (
        <Check className={cn("size-4 text-success", label && "mr-1")} aria-hidden="true" />
      ) : (
        <Link2 className={cn("size-4", label && "mr-1")} aria-hidden="true" />
      )}
      {label && resolvedLabel}
    </Button>
  );
}
