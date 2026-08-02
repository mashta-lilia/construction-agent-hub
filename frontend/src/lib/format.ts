/**
 * Formatting helpers ported from REHUB WORK V8.html, script block 1,
 * ~lines 184-186.
 */

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
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
): string {
  return amount == null ? t("budget.tbd") : formatCurrency(amount);
}

export function formatSize(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}
