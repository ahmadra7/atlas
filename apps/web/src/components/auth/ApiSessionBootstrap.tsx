"use client";

import { useEffect } from "react";
import { ensureApiSession } from "@/lib/client";

/** Boots JWT session when web talks to Nest/Postgres API. */
export function ApiSessionBootstrap() {
  useEffect(() => {
    void ensureApiSession(true).catch((err) => {
      console.warn("[atlas] API session failed", err);
    });
  }, []);
  return null;
}
