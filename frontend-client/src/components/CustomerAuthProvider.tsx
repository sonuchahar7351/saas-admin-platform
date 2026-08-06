"use client";

import { useEffect } from "react";
import { useCustomerAuthStore } from "../store/customer-auth-store";
import { apiClient } from "../lib/api-client";
import { silentRefresh } from "../lib/auth-refresh";

export function CustomerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setAuth, clearAuth, isLoading } = useCustomerAuthStore();

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await silentRefresh();
        // Note: we don't have a /customer-auth/me endpoint yet — add one, mirroring the admin app
        const meRes = await apiClient.get("/customer-auth/me", {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        });
        setAuth(meRes.data, data.accessToken);
      } catch {
        clearAuth();
      }
    };
    init();
  }, []);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">Loading…</div>
    );
  return <>{children}</>;
}
