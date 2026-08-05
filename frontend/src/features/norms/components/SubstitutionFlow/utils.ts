import type { Translator } from "@/features/norms/types";

/**
 * Resolves a field/table-row value that is EITHER a plain, locale-independent
 * string (`plain` -- numbers/units) OR an i18n key (`key` -- language-
 * dependent text) -- the two are mutually exclusive on `ScenarioField` /
 * `ScenarioTable2Row`, `key` wins when present. Mirrors the source
 * prototype's `L(f.value)` bilingual lookup (script block 1, ~line 3424),
 * adapted for the `value`/`valueKey` (and `actual`/`actualKey`,
 * `proposed`/`proposedKey`) split introduced when bilingual literals became
 * i18n keys (see `src/features/norms/types/index.ts`).
 */
export function resolveKeyedText(
  t: Translator,
  plain: string | undefined,
  key: string | undefined | null,
): string {
  if (key) return t(key);
  return plain ?? "";
}
