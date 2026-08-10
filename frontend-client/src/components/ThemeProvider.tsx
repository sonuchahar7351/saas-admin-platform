"use client";

import { useEffect } from "react";
import { useThemeStore } from "../store/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setTheme(saved || (systemPrefersDark ? "dark" : "light"));
  }, []);

  return <>{children}</>;
}
