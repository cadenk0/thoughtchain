"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "light",
      toggleTheme: () => set({ theme: get().theme === "light" ? "dark" : "light" }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "thoughtchain-theme" }
  )
);
