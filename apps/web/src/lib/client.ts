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

export const atlasClient = createAtlasClient({
  mode,
  baseUrl: process.env.NEXT_PUBLIC_ATLAS_API_URL ?? "http://localhost:4000",
  getAccessToken,
});

let sessionInflight: Promise<void> | null = null;

async function loginDemo(): Promise<void> {
  if (!("login" in atlasClient) || typeof atlasClient.login !== "function") {
    return;
  }
  const email =
    process.env.NEXT_PUBLIC_ATLAS_DEMO_EMAIL ?? "ahmad@atlas.local";
  const password =
    process.env.NEXT_PUBLIC_ATLAS_DEMO_PASSWORD ?? "atlas-demo";
  const result = await atlasClient.login(email, password);
  setAccessToken(result.accessToken);
}

/** Ensure demo JWT exists (and is usable) when API mode is http. */
export async function ensureApiSession(force = false): Promise<void> {
  if (mode !== "http") return;

  if (!force && getAccessToken()) {
    return;
  }

  if (!sessionInflight) {
    sessionInflight = loginDemo().finally(() => {
      sessionInflight = null;
    });
  }
  await sessionInflight;
}

function isUnauthorized(err: unknown): boolean {
  return err instanceof Error && /\bAPI 401\b/.test(err.message);
}

/** Run an API call; on 401 clear token, re-login once, retry. */
export async function withApiSession<T>(fn: () => Promise<T>): Promise<T> {
  await ensureApiSession();
  try {
    return await fn();
  } catch (err) {
    if (!isUnauthorized(err)) throw err;
    setAccessToken(null);
    await ensureApiSession(true);
    return await fn();
  }
}
