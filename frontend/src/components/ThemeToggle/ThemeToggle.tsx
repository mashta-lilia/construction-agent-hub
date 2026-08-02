import { useTheme } from "@/providers/ThemeProvider";
import { useI18n } from "@/hooks/useI18n";
import { Sun, Moon } from "@/components/Icon/icons";
import "./ThemeToggle.css";

/**
 * Ported from REHUB WORK V8.html (~lines 1608-1621).
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={t(isDark ? "theme.dark" : "theme.light")}
      className="rh-theme-toggle"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
