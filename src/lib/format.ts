import type { TranslationKey } from '@/i18n/locales/en';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return currency.format(value);
}

/** Signed amount, used for the substitution cost impact (`−$18,500`). */
export function formatDelta(value: number): string {
  const sign = value < 0 ? '−' : '+';
  return `${sign}${currency.format(Math.abs(value))}`;
}

/** A project with no budget yet renders as "TBD" / "Визначається". */
export function formatBudget(value: number | null, t: (key: TranslationKey) => string): string {
  return value === null ? t('budget.tbd') : currency.format(value);
}

export function formatSize(sizeKb: number): string {
  return sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${String(sizeKb)} KB`;
}
