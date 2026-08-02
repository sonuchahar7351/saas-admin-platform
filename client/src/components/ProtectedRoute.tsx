"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth-store";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push("/dashboard"); // logged in, but wrong role for this specific page
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null; // redirect is in flight
  }

  return <>{children}</>;
}
