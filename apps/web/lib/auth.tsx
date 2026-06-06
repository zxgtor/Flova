"use client";

/**
 * Auth context — token in localStorage. Skeleton-quality: production should use a
 * httpOnly cookie set by the backend and refresh-token flow.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, type UserOut } from "@/lib/api";

const STORAGE_KEY = "flova.token";

type AuthState = {
  token: string | null;
  user: UserOut | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserOut | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from storage + fetch /me.
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!stored) {
      setLoading(false);
      return;
    }
    setToken(stored);
    api
      .me(stored)
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(async (t: string) => {
    localStorage.setItem(STORAGE_KEY, t);
    setToken(t);
    const u = await api.me(t);
    setUser(u);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { access_token } = await api.login(email, password);
      await persist(access_token);
    },
    [persist],
  );

  const register = useCallback(
    async (email: string, password: string, displayName = "") => {
      const { access_token } = await api.register(email, password, displayName);
      await persist(access_token);
    },
    [persist],
  );

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, loading, signIn, register, signOut }),
    [token, user, loading, signIn, register, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
