import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

/**
 * Thin wrapper around react-i18next's language state, replacing the
 * original prototype's `LocaleCtx`/`LocaleProvider`
 * (REHUB WORK V8.html, ~lines 144-149) which used its own
 * localStorage-backed useState. `i18next-browser-languagedetector` (see
 * src/i18n/index.ts) now persists/detects the language instead; this
 * provider only re-exposes `i18n.language` / `i18n.changeLanguage` under
 * the same `{ locale, setLocale }` shape the rest of the app expects, via
 * `hooks/useI18n.ts`.
 *
 * Do not reimplement a parallel translation dictionary here -- resource
 * JSON lives in `src/i18n/locales/{en,uk}/*.json`.
 */
export interface LocaleContextValue {
  locale: string;
  setLocale: (locale: string) => void;
}

const LocaleCtx = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale: i18n.language,
      setLocale: (locale: string) => {
        void i18n.changeLanguage(locale);
      },
    }),
    // i18n.language is tracked explicitly: react-i18next re-renders this
    // component on language change, but the `i18n` instance's identity
    // never changes, so it alone would leave `value` stale.
    [i18n, i18n.language],
  );

  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleCtx);
}
