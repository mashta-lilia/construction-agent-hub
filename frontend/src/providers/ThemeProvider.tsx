import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Light/dark theme state, ported from REHUB WORK V8.html script block 1
 * (~lines 151-161). Same behavior as the source: persisted to
 * localStorage under "rh-theme", and mirrored onto
 * `document.documentElement` as a `dark` class -- every component CSS
 * file in `src/components` keys its dark-mode overrides off
 * `html.dark ...`, so this class name must stay in sync with
 * `src/styles/tokens.css`.
 */
export type Theme = "light" | "dark";

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = "rh-theme";

const ThemeCtx = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
});

function readInitialTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore persistence errors (e.g. private browsing) */
    }
  }, [theme]);

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeCtx);
}
