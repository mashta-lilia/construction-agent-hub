import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      className="btn btn-outline-secondary btn-sm"
      aria-label={t(isDark ? 'theme.dark' : 'theme.light')}
      onClick={() => {
        setTheme(isDark ? 'light' : 'dark');
      }}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
