import { createAtlasClient, type AtlasClient } from "@atlas/api-client";
import {
  getRuntimeConfigSync,
  loadRuntimeConfig,
  resetRuntimeConfigCache,
  type AtlasRuntimeConfig,
} from "@/lib/runtime-config";

const TOKEN_KEY = "atlas_access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function buildClient(config: AtlasRuntimeConfig): AtlasClient {
  const mode = config.apiMode === "http" ? "http" : "mock";
  const baseUrl =
    config.apiUrl ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://127.0.0.1:4000");
  return createAtlasClient({
    mode,
    baseUrl,
    getAccessToken,
  });
}

function configKey(config: AtlasRuntimeConfig) {
  return `${config.apiMode}|${config.apiUrl ?? ""}`;
}

let impl: AtlasClient = buildClient(getRuntimeConfigSync());
let installedKey = configKey(getRuntimeConfigSync());
let ready: Promise<void> | null = null;

function installClient(next: AtlasClient, key: string) {
  impl = next;
  installedKey = key;
}

/** Apply runtime config (and rebuild HTTP/mock client) before data fetch. */
export async function initAtlasClient(force = false): Promise<void> {
  if (force) {
    resetRuntimeConfigCache();
    ready = null;
  }
  if (ready) {
    await ready;
    // If config changed after first init (e.g. live JSON arrived), rebuild.
    const config = getRuntimeConfigSync();
    const key = configKey(config);
    if (key !== installedKey) {
      installClient(buildClient(config), key);
    }
    return;
  }
  ready = (async () => {
    const config = await loadRuntimeConfig();
    installClient(buildClient(config), configKey(config));
  })();
  return ready;
}

export const atlasClient: AtlasClient = new Proxy({} as AtlasClient, {
  get(_target, prop) {
    const value = Reflect.get(impl as object, prop);
    if (typeof value !== "function") return value;
    return async (...args: unknown[]) => {
      await initAtlasClient();
      const fn = Reflect.get(impl as object, prop) as (
        ...a: unknown[]
      ) => unknown;
      return fn.apply(impl, args);
    };
  },
});

/** HTTP calls run with the stored user token; guests stay unauthenticated. */
export async function ensureApiSession(_force = false): Promise<void> {
  await initAtlasClient(_force);
}

export async function withApiSession<T>(fn: () => Promise<T>): Promise<T> {
  await initAtlasClient();
  return fn();
}
