"use client";

import { useEffect } from "react";
import { hydrateAuthSession } from "@/lib/auth-session";

/** Restores the saved login token before API calls. */
export function ApiSessionBootstrap() {
  useEffect(() => {
    hydrateAuthSession();
  }, []);
  return null;
}
