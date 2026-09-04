import { createAtlasClient } from "@atlas/api-client";

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

const mode =
  process.env.NEXT_PUBLIC_ATLAS_API_MODE === "http" ? "http" : "mock";

function atlasApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_ATLAS_API_URL) {
    return process.env.NEXT_PUBLIC_ATLAS_API_URL;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://127.0.0.1:4000";
}

export const atlasClient = createAtlasClient({
  mode,
  baseUrl: atlasApiBaseUrl(),
  getAccessToken,
});

/** HTTP calls run with the stored user token; guests stay unauthenticated. */
export async function ensureApiSession(_force = false): Promise<void> {
  return;
}

export async function withApiSession<T>(fn: () => Promise<T>): Promise<T> {
  return fn();
}
