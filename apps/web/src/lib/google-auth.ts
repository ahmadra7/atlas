export type GoogleProfile = {
  googleId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  accessToken: string;
};

const GOOGLE_SCOPES = "openid email profile";

let cachedClientId: string | null = null;

export function googleClientIdFromEnv() {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";
}

export async function resolveGoogleClientId(): Promise<string> {
  if (cachedClientId) return cachedClientId;
  const fromEnv = googleClientIdFromEnv();
  if (fromEnv) {
    cachedClientId = fromEnv;
    return fromEnv;
  }
  try {
    const res = await fetch("/api/auth/google/config", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { clientId?: string };
      const id = data.clientId?.trim() ?? "";
      if (id) {
        cachedClientId = id;
        return id;
      }
    }
  } catch {
    /* API may be down */
  }
  return "";
}

async function googleJson<T>(url: string, accessToken: string): Promise<T | null> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export function readGoogleRedirectToken(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const error = params.get("error")?.trim();
  if (error && error !== "none") return null;
  return params.get("access_token")?.trim() || null;
}

export function clearGoogleRedirectHash() {
  if (typeof window === "undefined") return;
  if (!window.location.hash) return;
  const url = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", url);
}

const PUBLIC_APP_ORIGIN = "https://ahmad.tail4cb55d.ts.net";

export function googleRedirectOrigin() {
  const fromEnv = process.env.NEXT_PUBLIC_APP_ORIGIN?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const origin = window.location.origin;
  if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
    return PUBLIC_APP_ORIGIN;
  }
  return origin;
}

/** Opens Google's real account chooser on the public app URL, then returns to /auth. */
export function startGoogleRedirect(clientId: string) {
  const redirectUri = `${googleRedirectOrigin()}/auth`;
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "token");
  url.searchParams.set("scope", GOOGLE_SCOPES);
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("include_granted_scopes", "true");
  window.location.assign(url.toString());
}

export async function beginGoogleLogin(): Promise<void> {
  const clientId = await resolveGoogleClientId();
  if (!clientId) throw new Error("GOOGLE_NOT_CONFIGURED");
  startGoogleRedirect(clientId);
}

export async function fetchGoogleProfile(
  accessToken: string,
): Promise<Omit<GoogleProfile, "accessToken">> {
  const [tokenInfo, userInfo] = await Promise.all([
    fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(accessToken)}`,
    ).then(async (res) =>
      res.ok
        ? ((await res.json()) as {
            sub?: string;
            email?: string;
            aud?: string;
          })
        : null,
    ),
    googleJson<{
      sub?: string;
      email?: string;
      name?: string;
      given_name?: string;
      picture?: string;
    }>("https://www.googleapis.com/oauth2/v3/userinfo", accessToken),
  ]);

  const expectedAud = cachedClientId || googleClientIdFromEnv();
  if (expectedAud && tokenInfo?.aud && tokenInfo.aud !== expectedAud) {
    throw new Error("GOOGLE_TOKEN");
  }

  const googleId = userInfo?.sub?.trim() || tokenInfo?.sub?.trim() || "";
  const email = (userInfo?.email || tokenInfo?.email || "").trim().toLowerCase();
  if (!googleId || !email) throw new Error("GOOGLE_PROFILE");

  return {
    googleId,
    email,
    displayName:
      userInfo?.name?.trim() || userInfo?.given_name?.trim() || "",
    avatarUrl: userInfo?.picture?.trim() || null,
  };
}
