"use client";

import { useEffect } from "react";
import {
  clearPageCache,
  clearPageCacheIfHardNav,
} from "@/lib/page-cache";

/**
 * Browser refresh and bfcache restores must not keep stale SPA data
 * after server-side catalog/session resets.
 */
export function PageCacheLifecycle() {
  useEffect(() => {
    clearPageCacheIfHardNav();

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) clearPageCache();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
