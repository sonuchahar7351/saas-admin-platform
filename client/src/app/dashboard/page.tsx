"use client";

import { useAuthStore } from "../../store/auth-store";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Welcome, {user?.name}</h1>
      <p className="mt-1 text-sm text-gray-500">Role: {user?.role}</p>
    </div>
  );
}
