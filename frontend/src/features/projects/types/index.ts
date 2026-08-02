/**
 * Ported from REHUB WORK V8.html, script block 1, ~lines 938-994.
 *
 * Every bilingual `{ en, uk }` field from the prototype's `B(en, uk)` helper
 * has been replaced by an i18n key (suffixed `Key`) resolved at render time
 * via `useI18n().t(key)` -- see `src/i18n/locales/{en,uk}/projects.json` for
 * the actual strings under the `projects.seed.*` / `projects.engineer.*`
 * namespaces. This module holds IDs/keys/structure/numbers only.
 */

/** Values double as the literal `status.*` / `filter.stageLabel` i18n keys' suffix. */
export type StageKey = "planning" | "inProgress" | "audit" | "onHold" | "completed";

export type RiskLevel = "green" | "amber" | "red";

/**
 * An engineer is represented purely by an i18n key resolving to their display
 * name (`projects.engineer.*`). There is no separate `Engineer` record shape
 * in the source prototype -- `ENGINEERS` is just a flat name-key list used by
 * the Lead Engineer / Team `Select`/`MultiSelect` pickers.
 */
export type EngineerNameKey = string;

export interface Project {
  id: string;
  nameKey: string;
  statusKey: StageKey;
  budget: number | null;
  updatedKey: string;
  hasAlert: boolean;
  clientKey: string;
  /** Note: NOT drawn from `ENGINEERS` -- a project's lead engineer is its own
   * i18n key, independent of the `ENGINEERS` picker list, matching the source
   * data exactly (some projects' lead engineers do not appear in `ENGINEERS`
   * at all -- e.g. "Volodymyr Kuzemko" on PRJ-1042 is also `CURRENT_USER`). */
  leadEngineerKey: string;
  locationKey: string;
  deadlineKey: string;
  risk: RiskLevel;
  phaseKey: string;
  hasDemo: boolean;
  /** Team (access) members, drawn from `ENGINEERS` by reference. */
  teamKeys: EngineerNameKey[];
  /** Manual override set via Edit/New Project (item 7); when unset the
   * address is derived from the project's ENGLISH name via
   * `projectEmailAddress` (constants/data.ts) -- slugs are always Latin, so
   * callers must resolve `nameKey` forced to English (e.g.
   * `i18n.getFixedT("en")(nameKey)`), never the current UI locale. */
  corporateEmail?: string;
}
