/**
 * Formatting helpers ported from REHUB WORK V8.html, script block 1,
 * ~lines 184-186.
 */

const NUMBER_FORMAT_LOCALE: Record<string, string> = {
  en: "en-US",
  uk: "uk-UA",
};

/**
 * Currency stays USD regardless of UI language -- every budget figure in
 * the seed data and every report template is already USD-denominated
 * (deliberate: cross-border construction reporting), so this is not an
 * oversight. Only the NUMBER FORMATTING (grouping separators, symbol
 * placement) follows the active locale; `locale` is the app's `"en"`/`"uk"`
 * locale code from `useI18n()`, not a full BCP-47 tag.
 */
export function formatCurrency(amount: number, locale: string = "en"): string {
  return new Intl.NumberFormat(NUMBER_FORMAT_LOCALE[locale] ?? "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * `t` is whatever translation function the caller has in scope (typically
 * `useI18n().t`) -- kept generic here (rather than importing the i18n hook)
 * so this module stays a pure, React-free utility per `lib/` conventions.
 */
export function formatBudget(
  amount: number | null | undefined,
  t: (key: string) => string,
  locale: string = "en",
): string {
  return amount == null ? t("budget.tbd") : formatCurrency(amount, locale);
}

export function formatSize(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}
