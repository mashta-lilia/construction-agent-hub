import type { BilingualString, Locale, Localizable } from '@/types';

/**
 * Builds a bilingual value. Direct port of the prototype's `B(en, uk)` helper —
 * kept as a one-liner so the mock data reads exactly like the original.
 */
export const B = (en: string, uk: string): BilingualString => ({ en, uk });

/** Type guard: `true` for `{ en, uk }`, `false` for plain strings. */
export function isBilingual(value: unknown): value is BilingualString {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    ('en' in value || 'uk' in value)
  );
}

/**
 * Resolves a `Localizable` for the given locale, falling back to `en`.
 * `useI18n()` exposes this as `L()` (step 2).
 */
export function resolveBilingual(value: Localizable, locale: Locale): string {
  if (!isBilingual(value)) return value;
  return value[locale];
}
