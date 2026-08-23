"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { useAuthStore } from "../../store/auth-store";
import { navItems } from "../../config/nav-items";
import { authApi } from "../../lib/auth-api";
import { Avatar } from "../../components/Avatar";
import { RoleBadge } from "../../components/RoleBadge";
import { showInfo } from "../../lib/toast";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authApi.logout();
    clearAuth();
    showInfo("Logged out.");
    router.push("/login");
  };

  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <div className="flex h-full flex-col bg-sidebar-bg px-4 py-5">
      <div className="mb-8 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-accent" />
          <span className="font-display text-sm font-semibold text-white">
            Admin Console
          </span>
        </div>
        <button
          onClick={onNavigate}
          className="text-sidebar-text hover:text-white lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-white/10 font-medium text-white"
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
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-sidebar-text transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar — always visible at lg+ */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <SidebarContent />
        </aside>

        {/* Mobile drawer — slides in over content, only rendered when open */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-72 shadow-2xl">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile top bar — hamburger trigger, hidden at lg+ where the sidebar is always visible */}
          <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-4 lg:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-text-secondary hover:text-text-primary"
            >
              <Menu size={22} />
            </button>
            <span className="font-display text-sm font-semibold">
              Admin Console
            </span>
          </div>

          <main className="flex-1 overflow-y-auto bg-bg p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
