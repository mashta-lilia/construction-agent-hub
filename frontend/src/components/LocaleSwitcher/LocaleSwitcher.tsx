import { useTranslation } from 'react-i18next';

import { isLocale, LOCALES, writeLocaleCookie } from '@/i18n/config';

const LABELS: Record<string, string> = { en: 'English', uk: 'Українська' };

export function LocaleSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      className="form-select form-select-sm w-auto"
      value={i18n.language}
      aria-label="Language"
      onChange={(event) => {
        const next = event.target.value;
        if (!isLocale(next)) return;
        writeLocaleCookie(next);
        document.documentElement.lang = next;
        void i18n.changeLanguage(next);
      }}
    >
      {LOCALES.map((code) => (
        <option key={code} value={code}>
          {LABELS[code] ?? code}
        </option>
      ))}
    </select>
  );
}
