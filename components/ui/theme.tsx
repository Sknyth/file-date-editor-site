"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";

export function Theme({ children }: { children: ReactNode }) {
  return <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>{children}</ThemeProvider>;
}

export function ThemeToggle({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button type="button" className="icon-button theme-button" aria-label={label} title={label}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
      <Sun size={18} className="theme-sun" aria-hidden="true" />
      <Moon size={17} className="theme-moon" aria-hidden="true" />
    </button>
  );
}
