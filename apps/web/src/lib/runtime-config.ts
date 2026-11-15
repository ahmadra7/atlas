export type AtlasRuntimeConfig = {
  apiMode: "mock" | "http";
  apiUrl?: string;
};

const DEFAULT_CONFIG: AtlasRuntimeConfig = {
  apiMode:
    process.env.NEXT_PUBLIC_ATLAS_API_MODE === "http" ? "http" : "mock",
  apiUrl: process.env.NEXT_PUBLIC_ATLAS_API_URL || undefined,
};

let cached: AtlasRuntimeConfig | null = null;
let loading: Promise<AtlasRuntimeConfig> | null = null;

export function getRuntimeConfigSync(): AtlasRuntimeConfig {
  return cached ?? DEFAULT_CONFIG;
}

/** Loads `/atlas-runtime-config.json` once (Netlify can point at a live API without rebuild). */
export async function loadRuntimeConfig(): Promise<AtlasRuntimeConfig> {
  if (cached) return cached;
  if (loading) return loading;

  loading = (async () => {
    if (typeof window === "undefined") {
      cached = DEFAULT_CONFIG;
      return cached;
    }
    try {
      const res = await fetch(`/atlas-runtime-config.json?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        cached = DEFAULT_CONFIG;
        return cached;
      }
      const data = (await res.json()) as Partial<AtlasRuntimeConfig>;
      const apiMode = data.apiMode === "http" ? "http" : "mock";
      const apiUrl =
        typeof data.apiUrl === "string" && data.apiUrl.trim()
          ? data.apiUrl.trim().replace(/\/$/, "")
          : DEFAULT_CONFIG.apiUrl;
      cached = { apiMode, apiUrl };
      return cached;
    } catch {
      cached = DEFAULT_CONFIG;
      return cached;
    }
  })();

  return loading;
}
