import type { UserProfile } from "@atlas/contracts";
import { applyAuthProfile } from "@atlas/api-client";
import { pageCache } from "@/lib/page-cache";
import { setAccessToken } from "@/lib/client";

const STORAGE_KEY = "atlas-auth-session";
export const AUTH_EVENT = "atlas-auth";

export type StoredAuthSession = {
  accessToken: string;
  user: UserProfile;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

export function readAuthSession(): StoredAuthSession | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuthSession;
    if (!parsed?.accessToken || !parsed.user?.id) return null;
    if (parsed.user.id === "guest") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isAuthenticatedSession(session: StoredAuthSession | null) {
  return Boolean(session?.user?.id && session.user.id !== "guest");
}

export function persistAuthSession(session: StoredAuthSession | null) {
  if (!canUseStorage()) return;
  if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else localStorage.removeItem(STORAGE_KEY);
  setAccessToken(session?.accessToken ?? null);
  applyAuthProfile(session?.user ?? null);
  pageCache.profile = session?.user ?? null;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function hydrateAuthSession() {
  const session = readAuthSession();
  setAccessToken(session?.accessToken ?? null);
  applyAuthProfile(session?.user ?? null);
  pageCache.profile = session?.user ?? null;
  return session;
}

export function safeNextPath(raw: string | null | undefined): string {
  if (!raw) return "/home";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/home";
  if (raw.startsWith("/auth")) return "/home";
  return raw;
}
