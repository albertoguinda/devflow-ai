"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  encodeState,
  decodeState,
  buildShareUrl,
  getShareHash,
  isShareSafe,
} from "@/lib/application/share-state";

interface UseShareStateOptions {
  toolSlug: string;
  /** Called when shared state is loaded from URL */
  onLoad?: (state: Record<string, string>) => void;
}

interface UseShareStateReturn {
  /** Encode current state and get share URL */
  share: (state: Record<string, string>) => Promise<string | null>;
  /** Loaded state from URL (null if none) */
  sharedState: Record<string, string> | null;
  /** Whether the share URL was too long */
  isTooLong: boolean;
}

export function useShareState({ toolSlug, onLoad }: UseShareStateOptions): UseShareStateReturn {
  const pathname = usePathname();
  const [sharedState, setSharedState] = useState<Record<string, string> | null>(null);
  const [isTooLong, setIsTooLong] = useState(false);

  // On mount, check URL hash for shared state
  useEffect(() => {
    const hash = getShareHash();
    if (!hash) return;

    void (async () => {
      const payload = await decodeState(hash);
      if (payload && payload.tool === toolSlug) {
        setSharedState(payload.state);
        onLoad?.(payload.state);
        // Clean the hash from URL without triggering navigation
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", pathname);
        }
      }
    })();
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const share = useCallback(
    async (state: Record<string, string>): Promise<string | null> => {
      try {
        const encoded = await encodeState(toolSlug, state);

        if (!isShareSafe(encoded)) {
          setIsTooLong(true);
          return null;
        }

        setIsTooLong(false);
        const base = typeof window !== "undefined"
          ? window.location.origin + pathname
          : "";
        return buildShareUrl(base, encoded);
      } catch {
        return null;
      }
    },
    [toolSlug, pathname]
  );

  return { share, sharedState, isTooLong };
}
