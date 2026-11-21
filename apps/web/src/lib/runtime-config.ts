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

/** Clear so the next loadRuntimeConfig() re-reads the JSON / env. */
export function resetRuntimeConfigCache() {
  cached = null;
  loading = null;
}

/**
 * Loads `/atlas-runtime-config.json` once.
 *
 * Rules:
 * - JSON with `apiMode: "http"` + apiUrl → live (Netlify tunnel / prod override)
 * - Otherwise keep build-time env (local `.env.local` http → DB)
 * - Never let a committed mock JSON silently override local http env
 */
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
      const fileMode = data.apiMode === "http" ? "http" : "mock";
      const fileUrl =
        typeof data.apiUrl === "string" && data.apiUrl.trim()
          ? data.apiUrl.trim().replace(/\/$/, "")
          : "";

      if (fileMode === "http" && fileUrl) {
        cached = { apiMode: "http", apiUrl: fileUrl };
        return cached;
      }

      // Mock JSON must not win over local/dev http env.
      cached = DEFAULT_CONFIG;
      return cached;
    } catch {
      cached = DEFAULT_CONFIG;
      return cached;
    }
  })();

  return loading;
}
