'use client';

import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/theme-store';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <button
      onClick={toggleTheme}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:text-text"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
    </button>
  );
}