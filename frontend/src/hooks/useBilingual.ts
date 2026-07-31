import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { resolveBilingual } from '@/lib/bilingual';
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config';
import type { Localizable } from '@/types';

/**
 * Mock data (and, later, API payloads) carry bilingual values as `{ en, uk }`.
 * i18next only resolves dictionary keys, so this hook covers the data side:
 * `L(project.name)` returns the string for the active language.
 */
export function useBilingual(): (value: Localizable) => string {
  const { i18n } = useTranslation();
  const language = isLocale(i18n.language) ? i18n.language : DEFAULT_LOCALE;

  return useCallback((value: Localizable) => resolveBilingual(value, language), [language]);
}
