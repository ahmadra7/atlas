export type GoogleProfile = {
  googleId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  accessToken: string;
};

type TokenClient = {
  requestAccessToken: (opts?: { prompt?: string }) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            include_granted_scopes?: boolean;
            prompt?: "" | "none" | "consent" | "select_account";
            callback: (response: {
              access_token?: string;
              expires_in?: number;
              scope?: string;
              error?: string;
              error_description?: string;
            }) => void;
            error_callback?: (error: { type?: string; message?: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
].join(" ");

let gsiLoader: Promise<void> | null = null;

export function googleClientId() {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";
}

function loadGsi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("GOOGLE_UNAVAILABLE"));
  }
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gsiLoader) return gsiLoader;
  gsiLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-atlas-gsi]",
    );
    if (existing) {
      if (window.google?.accounts?.oauth2) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("GOOGLE_SDK")),
        { once: true },
      );
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.atlasGsi = "1";
    script.onload = () => resolve();
    script.onerror = () => {
      gsiLoader = null;
      reject(new Error("GOOGLE_SDK"));
    };
    document.head.appendChild(script);
  });
  return gsiLoader;
}

async function googleJson<T>(url: string, accessToken: string): Promise<T | null> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export async function fetchGoogleProfile(
  accessToken: string,
): Promise<Omit<GoogleProfile, "accessToken">> {
  const [tokenInfo, userInfo, people] = await Promise.all([
    fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(accessToken)}`,
    ).then(async (res) =>
      res.ok
        ? ((await res.json()) as {
            sub?: string;
            email?: string;
            email_verified?: string | boolean;
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
    googleJson<{
      names?: Array<{ displayName?: string; givenName?: string }>;
      emailAddresses?: Array<{ value?: string }>;
      photos?: Array<{ url?: string }>;
    }>(
      "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos",
      accessToken,
    ),
  ]);

  const expectedAud = googleClientId();
  if (expectedAud && tokenInfo?.aud && tokenInfo.aud !== expectedAud) {
    throw new Error("GOOGLE_TOKEN");
  }

  const googleId = userInfo?.sub?.trim() || tokenInfo?.sub?.trim() || "";
  const email = (
    userInfo?.email ||
    people?.emailAddresses?.[0]?.value ||
    tokenInfo?.email ||
    ""
  )
    .trim()
    .toLowerCase();
  if (!googleId || !email) throw new Error("GOOGLE_PROFILE");

  const photo = people?.photos?.[0]?.url?.replace(/=s\d+([?-]|$)/, "=s256$1");
  return {
    googleId,
    email,
    displayName:
      people?.names?.[0]?.displayName?.trim() ||
      userInfo?.name?.trim() ||
      userInfo?.given_name?.trim() ||
      people?.names?.[0]?.givenName?.trim() ||
      "",
    avatarUrl: photo?.trim() || userInfo?.picture?.trim() || null,
  };
}

export async function signInWithGoogle(): Promise<GoogleProfile> {
  const clientId = googleClientId();
  if (!clientId) throw new Error("GOOGLE_NOT_CONFIGURED");
  await loadGsi();
  const oauth = window.google?.accounts?.oauth2;
  if (!oauth) throw new Error("GOOGLE_SDK");

  const accessToken = await new Promise<string>((resolve, reject) => {
    const client = oauth.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_SCOPES,
      include_granted_scopes: true,
      prompt: "select_account",
      callback: (response) => {
        if (response.access_token) {
          resolve(response.access_token);
          return;
        }
        reject(new Error(response.error || "GOOGLE_CANCELLED"));
      },
      error_callback: (error) => {
        const type = error?.type ?? "";
        if (type === "popup_closed" || type === "popup_failed_to_open") {
          reject(new Error("GOOGLE_CANCELLED"));
          return;
        }
        reject(new Error(error?.message || "GOOGLE_FAILED"));
      },
    });
    client.requestAccessToken({ prompt: "select_account" });
  });

  const profile = await fetchGoogleProfile(accessToken);
  return { ...profile, accessToken };
}
