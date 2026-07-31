import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './locales/en';
import { uk } from './locales/uk';

export const LOCALES = ['en', 'uk'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/**
 * The active locale is kept in a cookie rather than `localStorage` so the
 * backend can read it too: report exports and supplier reply drafts have to be
 * generated in the language the engineer is working in.
 */
export const LOCALE_COOKIE = 'rehub-locale';

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const resources = {
  en: { common: en },
  uk: { common: uk },
} as const;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function readLocaleCookie(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;

  const match = new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`).exec(document.cookie);
  const value = match?.[1] ? decodeURIComponent(match[1]) : null;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function writeLocaleCookie(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${String(LOCALE_COOKIE_MAX_AGE)}; samesite=lax`;
}

/**
 * Keys are flat and contain dots (`'nav.projects'`), so both separators are
 * switched off — otherwise i18next would read them as nested paths. The
 * prototype's dictionaries use single-brace placeholders (`{name}`), hence the
 * interpolation override.
 */
void i18next.use(initReactI18next).init({
  resources,
  lng: readLocaleCookie(),
  fallbackLng: DEFAULT_LOCALE,
  defaultNS: 'common',
  ns: ['common'],
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false, prefix: '{', suffix: '}' },
});

export default i18next;
