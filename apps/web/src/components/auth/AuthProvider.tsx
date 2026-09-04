"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { LoginGateSheet } from "@/components/auth/LoginGateSheet";
import {
  AUTH_EVENT,
  hydrateAuthSession,
  persistAuthSession,
  readAuthSession,
  safeNextPath,
  type StoredAuthSession,
} from "@/lib/auth-session";

type AuthContextValue = {
  ready: boolean;
  isAuthenticated: boolean;
  user: StoredAuthSession["user"] | null;
  signIn: (session: StoredAuthSession) => void;
  signOut: () => void;
  requestLogin: (next?: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<StoredAuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [gate, setGate] = useState<{ open: boolean; next?: string }>({
    open: false,
  });

  useEffect(() => {
    setSession(hydrateAuthSession());
    setReady(true);
    function sync() {
      setSession(readAuthSession());
    }
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const signIn = useCallback((next: StoredAuthSession) => {
    persistAuthSession(next);
    setSession(next);
  }, []);

  const signOut = useCallback(() => {
    persistAuthSession(null);
    setSession(null);
  }, []);

  const requestLogin = useCallback((next?: string) => {
    setGate({ open: true, next: next ? safeNextPath(next) : undefined });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      isAuthenticated: Boolean(session?.user?.id && session.user.id !== "guest"),
      user: session?.user ?? null,
      signIn,
      signOut,
      requestLogin,
    }),
    [ready, session, signIn, signOut, requestLogin],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginGateSheet
        open={gate.open}
        onClose={() => setGate({ open: false, next: gate.next })}
        onLogin={() => {
          const next = gate.next;
          setGate({ open: false, next });
          const href = next
            ? `/auth?next=${encodeURIComponent(next)}`
            : "/auth";
          router.push(href);
        }}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
