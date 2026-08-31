import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { authApi } from "../api/auth";
import { ApiError } from "../api/client";
import { userApi } from "../api/resources";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  verify: (email: string, instanceCode: string) => Promise<User>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionChange = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const startedAt = sessionChange.current;

    userApi
      .me()
      .then((current) => {
        if (!cancelled && sessionChange.current === startedAt) {
          setUser(current);
        }
      })
      .catch(() => {
        if (!cancelled && sessionChange.current === startedAt) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const next = await authApi.login({ email, password });
        sessionChange.current += 1;
        setUser(next);
        return next;
      },
      register: async (email, password) => {
        const next = await authApi.register({ email, password });
        sessionChange.current += 1;
        if (next.verifiedAt) {
          setUser(next);
        }
        return next;
      },
      verify: async (email, instanceCode) => {
        const next = await authApi.verify({ email, instanceCode });
        sessionChange.current += 1;
        setUser(next);
        return next;
      },
      logout: async () => {
        try {
          await authApi.logout();
          sessionChange.current += 1;
          setUser(null);
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            sessionChange.current += 1;
            setUser(null);
            return;
          }
          throw error;
        }
      },
      deleteAccount: async () => {
        await userApi.remove();
        sessionChange.current += 1;
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
