"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, User } from "lucide-react";
import { useCustomerAuthStore } from "../store/customer-auth-store";
import { customerAuthApi } from "../lib/customer-auth-api";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/campaigns", label: "Explore" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { customer, clearAuth } = useCustomerAuthStore();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const closeAll = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await customerAuthApi.logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      clearAuth();
      closeAll();
      router.push("/");
    }
  };

  // Close user dropdown on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  // Escape closes whichever menu is open
  useEffect(() => {
    if (!mobileMenuOpen && !userMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileMenuOpen, userMenuOpen]);

  // Lock body scroll while the mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        {/* Desktop logo (left) */}
        <Link href="/" className="font-heading text-lg font-semibold">
          GiveForward
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden items-center gap-6 text-sm font-medium sm:flex"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-text-muted transition-colors hover:text-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile: hamburger on the left */}
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileMenuOpen(true)}
          className="-ml-2 rounded-lg p-2 text-text-muted transition-colors hover:bg-border/40 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop right-side controls */}
        <div className="hidden items-center gap-3 sm:flex">
          <ThemeToggle />
          {customer ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                aria-label="Open account menu"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <User className="h-4 w-4" />
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
                >
                  <Link
                    href="/account"
                    role="menuitem"
                    onClick={closeAll}
                    className="block px-4 py-2 text-sm text-text transition-colors hover:bg-border/40"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-text-muted transition-colors hover:bg-border/40 hover:text-text"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
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

      {/* Mobile sidebar + overlay */}
      <div
        className={`fixed inset-0 z-50 sm:hidden ${mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Overlay */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className={`absolute inset-0 transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Sidebar */}
        <div
          ref={sidebarRef}
          role="dialog"
          aria-modal="true"
          className={`absolute left-0 top-0 h-full w-64 max-w-[85%] transform border-r border-border bg-surface shadow-lg transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <span className="font-heading text-lg font-semibold">
              GiveForward
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-2 text-text-muted transition-colors hover:bg-border/40 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav
            className="flex flex-col gap-1 px-4 py-4 bg-surface"
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeAll}
                className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-border/40 hover:text-text"
              >
                {link.label}
              </Link>
            ))}

            <div className="my-3 border-t border-border" />

            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-medium text-text-muted">Theme</span>
              <ThemeToggle />
            </div>

            <div className="my-3 border-t border-border" />

            {customer ? (
              <>
                <Link
                  href="/account"
                  onClick={closeAll}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-border/40 hover:text-text"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-text-muted transition-colors hover:bg-border/40 hover:text-text"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeAll}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-border/40 hover:text-text"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={closeAll}
                  className="mt-1 rounded-lg bg-accent px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                >
                  Donate
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
