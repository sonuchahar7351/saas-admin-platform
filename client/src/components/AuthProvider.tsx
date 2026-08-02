"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/auth-store";
import { apiClient } from "../lib/api-client";
import { silentRefresh } from "../lib/auth-refresh";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, isLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await silentRefresh();
        // pass the token explicitly — don't rely on the store having updated yet
        const meRes = await apiClient.get("/auth/me", {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        });
        setAuth(meRes.data, data.accessToken);
      } catch {
        clearAuth();
      }
    };
    initAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
