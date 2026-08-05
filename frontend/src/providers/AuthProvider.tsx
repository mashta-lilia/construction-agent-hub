import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getCurrentUser, type AuthUser } from "@/features/auth";

interface AuthContextValue {
  user: AuthUser;
}

const AuthCtx = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AuthContextValue>(() => ({ user: getCurrentUser() }), []);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
