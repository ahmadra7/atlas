"use client";

import { useEffect } from "react";
import {
  clearPageCache,
  clearPageCacheIfHardNav,
} from "@/lib/page-cache";
import { initAtlasClient } from "@/lib/client";

/**
 * Browser refresh and bfcache restores must not keep stale SPA data
 * after server-side catalog/session resets.
 */
export function PageCacheLifecycle() {
  useEffect(() => {
    clearPageCacheIfHardNav();
    const nav = performance.getEntriesByType?.(
      "navigation",
    )?.[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type === "reload") {
      void initAtlasClient(true);
    }

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        clearPageCache();
        void initAtlasClient(true);
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
