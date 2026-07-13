"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/themeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme, mounted]);

  return <>{children}</>;
}
