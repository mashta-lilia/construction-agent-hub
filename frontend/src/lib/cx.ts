/**
 * Joins truthy class-name fragments with a space, dropping falsy ones.
 * Direct port of the original prototype's `cx` helper (REHUB WORK V8.html,
 * script block 1, ~line 183).
 */
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
