"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { useAuthStore } from "../../store/auth-store";
import { navItems } from "../../config/nav-items";
import { authApi } from "../../lib/auth-api";
import { Avatar } from "../../components/Avatar";
import { RoleBadge } from "../../components/RoleBadge";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authApi.logout();
    clearAuth();
    router.push("/login");
  };

  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <aside className="w-64 flex-col bg-sidebar-bg px-4 py-5 h-screen scrollbar-thin overflow-y-auto">
          <div className="mb-8 flex items-center gap-2 px-2">
            <div className="h-6 w-6 rounded bg-accent" />
            <span className="font-display text-sm font-semibold text-white">
              Admin Console
            </span>
          </div>

          <nav className="flex-1 space-y-0.5">
            {visibleItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-white/10 text-white font-medium"
                      : "text-sidebar-text hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2.5 px-2">
              <Avatar name={user?.name || ""} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {user?.name}
                </p>
                {user && <RoleBadge role={user.role} variant="dark" />}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-text transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </aside>

        <main className="w-full border-b border-border bg-surface p-3 text-center text-xs text-text-secondar overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
