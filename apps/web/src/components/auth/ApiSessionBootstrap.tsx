"use client";

import { useEffect } from "react";
import { hydrateAuthSession } from "@/lib/auth-session";
import { initAtlasClient } from "@/lib/client";

/** Restores the saved login token and applies runtime API config before calls. */
export function ApiSessionBootstrap() {
  useEffect(() => {
    hydrateAuthSession();
    void initAtlasClient();
  }, []);
  return null;
}
