"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "namira_theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Light/dark switching. The initial attribute is set by an inline script in the
 * root layout (before paint, so there is no flash); this provider only mirrors
 * that attribute into React state and writes it back on change.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setThemeState(current === "light" ? "light" : "dark");
  }, []);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.setAttribute("data-theme", next);
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage may be unavailable (private mode) — the attribute still applies */
    }
  }, []);

  const toggle = useCallback(() => {
    // Read the DOM rather than state so a fast double-click cannot desync.
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "light" ? "dark" : "light");
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  // Safe fallback for components rendered outside the provider.
  return { theme: "dark", setTheme: () => {}, toggle: () => {} };
}

/**
 * Runs before paint: applies the stored theme to <html>. Dark is the product
 * default — the system preference is deliberately not consulted, so a first
 * visit always lands on the dark palette.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var s=localStorage.getItem("${STORAGE_KEY}");document.documentElement.setAttribute("data-theme",s==="light"?"light":"dark");}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;
