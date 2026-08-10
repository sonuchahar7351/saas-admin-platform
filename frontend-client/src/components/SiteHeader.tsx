"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomerAuthStore } from "../store/customer-auth-store";
import { customerAuthApi } from "../lib/customer-auth-api";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  const { customer, clearAuth } = useCustomerAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await customerAuthApi.logout();
    clearAuth();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-heading text-lg font-semibold">
          GiveForward
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          <Link href="/campaigns" className="text-text-muted hover:text-text">
            Explore
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {customer ? (
            <>
              <Link
                href="/account"
                className="text-sm font-medium hover:text-accent"
              >
                {customer.name}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-text-muted hover:text-text"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium hover:text-accent"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Donate
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
