import { useTranslation } from "react-i18next";
import { useLocale, type LocaleContextValue } from "@/providers/LocaleProvider";
import { NAMESPACES } from "@/i18n";

/**
 * Compatibility shim for the original prototype's `useI18n()`
 * (REHUB WORK V8.html, script block 1, ~lines 171-180).
 *
 * Every feature ported from the prototype calls `useI18n()` to get
 * `{ t, L, locale, setLocale }`, where:
 *   - `t(key, vars)` looks up a translation key and substitutes `vars`.
 *   - `L(bilingualObj)` picks `bilingualObj[locale]` (falling back to
 *     `.en`) for the app's `{ en, uk }`-shaped domain data (project names,
 *     deadlines, etc. -- NOT UI copy, which always goes through `t`).
 *
 * This hook keeps that exact call shape so ported features are close to
 * copy-paste, but backs `t` with react-i18next's `useTranslation()` and
 * `locale`/`setLocale` with `useLocale()` (providers/LocaleProvider).
 *
 * Interpolation: the original manually replaced `{var}` tokens (source
 * ~line 175: `s.split("{" + k + "}").join(vars[k])`). react-i18next's
 * default interpolation syntax is `{{var}}`, and `src/i18n/index.ts` sets
 * `interpolation: { escapeValue: false }` (no HTML-escaping, matching the
 * original's plain string substitution) but does NOT change the
 * `{{var}}` delimiters. The JSON resources under
 * `src/i18n/locales/{en,uk}/*.json` must use `{{var}}` placeholders (the
 * react-i18next default), not the original's single-brace `{var}`.
 *
 * Namespaces: the flat I18N dict was split into per-feature namespace
 * files (see `src/i18n` NAMESPACES) with no per-key namespace prefix,
 * matching the original's flat, unprefixed key names. `useTranslation` is
 * called here with the *full* namespace list so a bare `t("some.key")`
 * resolves regardless of which namespace file actually holds it --
 * i18next tries each namespace in the given order until one has the key.
 */

export interface BilingualValue {
  en: string;
  uk?: string;
  [locale: string]: string | undefined;
}

function isBilingualValue(value: unknown): value is BilingualValue {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    ("en" in value || "uk" in value)
  );
}

export interface UseI18nResult extends LocaleContextValue {
  t: (key: string, vars?: Record<string, string | number>) => string;
  L: {
    (value: BilingualValue): string;
    <T>(value: T): T;
  };
}

export function useI18n(): UseI18nResult {
  const { t: translate } = useTranslation(NAMESPACES);
  const { locale, setLocale } = useLocale();

  const t = (key: string, vars?: Record<string, string | number>): string => translate(key, vars);

  function L(value: BilingualValue): string;
  function L<T>(value: T): T;
  function L(value: unknown): unknown {
    if (isBilingualValue(value)) {
      return value[locale] ?? value.en;
    }
    return value;
  }

  return { locale, setLocale, t, L };
}
