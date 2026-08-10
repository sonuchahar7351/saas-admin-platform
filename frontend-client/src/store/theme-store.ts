import { create } from "zustand";

interface ThemeState {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  setTheme: (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    set({ theme });
  },
  toggleTheme: () => get().setTheme(get().theme === "light" ? "dark" : "light"),
}));
