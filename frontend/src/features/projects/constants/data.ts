/**
 * Ported from REHUB WORK V8.html, script block 1, ~lines 938-1052.
 *
 * All bilingual `B(en, uk)` literals from the source (project names, client
 * names, engineer names, locations, deadlines, phases) have been replaced by
 * i18n keys under the `projects.seed.*` / `projects.engineer.*` namespaces
 * (`src/i18n/locales/{en,uk}/projects.json`). This module holds IDs, keys,
 * structure and numbers only -- render with `useI18n().t(key)`.
 */
import i18n from "@/i18n";
import type { EngineerNameKey, Project, RiskLevel, StageKey } from "@/features/projects/types";

/** Named literals (not array-indexed -- `noUncheckedIndexedAccess` would mark indexed
 * reads/destructures from a non-tuple array as possibly `undefined`) reused both by
 * `ENGINEERS` below and by each project's inlined `teamKeys`. */
const IVAN_FRANKO: EngineerNameKey = "projects.engineer.ivanFranko";
const TARAS_SHEVCHENKO: EngineerNameKey = "projects.engineer.tarasShevchenko";
const LESYA_UKRAINKA: EngineerNameKey = "projects.engineer.lesyaUkrainka";
const VOLODYMYR_KUZMENKO: EngineerNameKey = "projects.engineer.volodymyrKuzmenko";
const OKSANA_ZABUZHKO: EngineerNameKey = "projects.engineer.oksanaZabuzhko";

/** Shared dummy engineer directory used by Select-based pickers (New Project / Edit Project). */
export const ENGINEERS: readonly EngineerNameKey[] = [
  IVAN_FRANKO,
  TARAS_SHEVCHENKO,
  LESYA_UKRAINKA,
  VOLODYMYR_KUZMENKO,
  OKSANA_ZABUZHKO,
];

/* Seed each project's Team (access) with 1-3 engineers from ENGINEERS, so EditProjectModal's
   Team MultiSelect and ProjectDetail's Team badge row have real data out of the box. Inlined
   directly into each PROJECTS literal (rather than post-hoc index assignment) so every field
   is set exactly once and `noUncheckedIndexedAccess` never sees a partially-built object. */
export const PROJECTS: Project[] = [
  {
    id: "PRJ-1042",
    nameKey: "projects.seed.prj1042.name",
    statusKey: "inProgress",
    budget: 4820000,
    updatedKey: "projects.seed.prj1042.updated",
    hasAlert: true,
    clientKey: "projects.seed.prj1042.client",
    leadEngineerKey: "projects.seed.prj1042.leadEngineer",
    locationKey: "projects.seed.prj1042.location",
    deadlineKey: "projects.seed.prj1042.deadline",
    risk: "amber",
    phaseKey: "projects.seed.prj1042.phase",
    hasDemo: true,
    teamKeys: [IVAN_FRANKO, LESYA_UKRAINKA],
  },
  {
    id: "PRJ-1038",
    nameKey: "projects.seed.prj1038.name",
    statusKey: "inProgress",
    budget: 2150000,
    updatedKey: "projects.seed.prj1038.updated",
    hasAlert: true,
    clientKey: "projects.seed.prj1038.client",
    leadEngineerKey: "projects.seed.prj1038.leadEngineer",
    locationKey: "projects.seed.prj1038.location",
    deadlineKey: "projects.seed.prj1038.deadline",
    risk: "green",
    phaseKey: "projects.seed.prj1038.phase",
    hasDemo: true,
    teamKeys: [TARAS_SHEVCHENKO, OKSANA_ZABUZHKO],
  },
  {
    id: "PRJ-1031",
    nameKey: "projects.seed.prj1031.name",
    statusKey: "onHold",
    budget: 9100000,
    updatedKey: "projects.seed.prj1031.updated",
    hasAlert: false,
    clientKey: "projects.seed.prj1031.client",
    leadEngineerKey: "projects.seed.prj1031.leadEngineer",
    locationKey: "projects.seed.prj1031.location",
    deadlineKey: "projects.seed.prj1031.deadline",
    risk: "red",
    phaseKey: "projects.seed.prj1031.phase",
    hasDemo: false,
    teamKeys: [VOLODYMYR_KUZMENKO],
  },
  {
    id: "PRJ-1027",
    nameKey: "projects.seed.prj1027.name",
    statusKey: "inProgress",
    budget: 15400000,
    updatedKey: "projects.seed.prj1027.updated",
    hasAlert: false,
    clientKey: "projects.seed.prj1027.client",
    leadEngineerKey: "projects.seed.prj1027.leadEngineer",
    locationKey: "projects.seed.prj1027.location",
    deadlineKey: "projects.seed.prj1027.deadline",
    risk: "green",
    phaseKey: "projects.seed.prj1027.phase",
    hasDemo: false,
    teamKeys: [IVAN_FRANKO, OKSANA_ZABUZHKO],
  },
  {
    id: "PRJ-1019",
    nameKey: "projects.seed.prj1019.name",
    statusKey: "planning",
    budget: 3300000,
    updatedKey: "projects.seed.prj1019.updated",
    hasAlert: true,
    clientKey: "projects.seed.prj1019.client",
    leadEngineerKey: "projects.seed.prj1019.leadEngineer",
    locationKey: "projects.seed.prj1019.location",
    deadlineKey: "projects.seed.prj1019.deadline",
    risk: "green",
    phaseKey: "projects.seed.prj1019.phase",
    hasDemo: true,
    teamKeys: [LESYA_UKRAINKA],
  },
  {
    id: "PRJ-1004",
    nameKey: "projects.seed.prj1004.name",
    statusKey: "completed",
    budget: 1780000,
    updatedKey: "projects.seed.prj1004.updated",
    hasAlert: false,
    clientKey: "projects.seed.prj1004.client",
    leadEngineerKey: "projects.seed.prj1004.leadEngineer",
    locationKey: "projects.seed.prj1004.location",
    deadlineKey: "projects.seed.prj1004.deadline",
    risk: "green",
    phaseKey: "projects.seed.prj1004.phase",
    hasDemo: false,
    teamKeys: [TARAS_SHEVCHENKO, VOLODYMYR_KUZMENKO],
  },
  {
    id: "PRJ-1061",
    nameKey: "projects.seed.prj1061.name",
    statusKey: "planning",
    budget: null,
    updatedKey: "projects.seed.prj1061.updated",
    hasAlert: false,
    clientKey: "projects.seed.prj1061.client",
    leadEngineerKey: "projects.seed.prj1061.leadEngineer",
    locationKey: "projects.seed.prj1061.location",
    deadlineKey: "projects.seed.prj1061.deadline",
    risk: "green",
    phaseKey: "projects.seed.prj1061.phase",
    hasDemo: false,
    teamKeys: [OKSANA_ZABUZHKO],
  },
];

/**
 * The current logged-in user's display-name key -- matched against
 * `Project.leadEngineerKey`/`teamKeys` to derive "My Profile"'s assigned-projects
 * list. Deliberately ALIASES PRJ-1042's `leadEngineerKey` (same person,
 * "Volodymyr Kuzemko") instead of registering its own separate i18n key: the
 * source used `B("Volodymyr Kuzemko", ...)` for both `CURRENT_USER` and
 * PRJ-1042's `leadEngineer`, two independently-constructed-but-equal bilingual
 * objects. Any "assigned to me" matching logic now compares this key by
 * reference/string-equality against `leadEngineerKey`/`teamKeys`, which is more
 * robust than the original's implicit string-content comparison. Written as the
 * same literal key rather than `PROJECTS[0].leadEngineerKey` so this is exempt
 * from `noUncheckedIndexedAccess` array-index narrowing.
 */
export const CURRENT_USER_NAME_KEY: string = "projects.seed.prj1042.leadEngineer";

/* Fixed "Stage of Work" options -- these values ARE the project's statusKey, so picking a
   stage in Edit Project drives the exact same field that the ProjectsTable's Stage column
   and StatusBadge already read from. Labels are sourced from the existing status.* i18n
   keys (common.json, single source of truth) rather than duplicated bilingual strings. */
export const STAGE_KEYS: readonly StageKey[] = [
  "planning",
  "inProgress",
  "audit",
  "onHold",
  "completed",
];

export const RISK_LEVELS: readonly RiskLevel[] = ["green", "amber", "red"];

/* Month/year deadline picker helpers. Existing PROJECTS entries store deadlines as i18n keys
   resolving to short strings like "Nov 2026"/"Листопад 2026" or special labels like "TBD"/
   "Completed" (see projects.json). These helpers round-trip a native <input type="month">
   value ("YYYY-MM") to/from that exact same display format so edited rows stay visually
   consistent. Unlike project names/clients/etc, month abbreviations are locale-formatting
   data (one fixed table per locale), not free-form UI copy -- kept as plain arrays rather
   than 24 extra i18n keys, mirroring how `formatCurrency` also bypasses i18n for the same
   reason (see lib/format.ts). Flagged for the team's awareness rather than guessed silently. */
export const MONTHS_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;
export const MONTHS_UK = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
] as const;

export interface DeadlineDisplay {
  en: string;
  uk: string;
}

export function formatDeadlineFromMonth(monthValue: string): DeadlineDisplay {
  if (!monthValue) return { en: "TBD", uk: "Визначається" };
  const [y, m] = monthValue.split("-").map(Number);
  const idx = (m ?? 0) - 1;
  if (idx < 0 || idx > 11 || !y) return { en: "TBD", uk: "Визначається" };
  const en = MONTHS_EN[idx];
  const uk = MONTHS_UK[idx];
  if (en === undefined || uk === undefined) return { en: "TBD", uk: "Визначається" };
  return { en: `${en} ${y}`, uk: `${uk} ${y}` };
}

export function parseDeadlineToMonthValue(deadlineEn: string): string {
  const m = /^([A-Za-z]{3})\w*\s+(\d{4})$/.exec((deadlineEn || "").trim());
  if (!m) return "";
  const monthAbbr = m[1];
  const year = m[2];
  if (!monthAbbr || !year) return "";
  const idx = MONTHS_EN.indexOf(monthAbbr as (typeof MONTHS_EN)[number]);
  if (idx === -1) return "";
  return `${year}-${String(idx + 1).padStart(2, "0")}`;
}

/* ===== Corporate email architecture (per project) ==========================
   Every project is auto-provisioned a corporate mailbox address derived
   from its English name -- no manual "connect mailbox" step (item 5).
   Used by NewProjectModal (live preview while typing the name),
   EditProjectModal (read-only display), InboxTab's banner, and the
   Project Mailboxes overview/detail views. */

/* Ukrainian Cyrillic -> Latin transliteration table (based on the official Ukrainian
   national transliteration system, simplified for slug purposes). Lets a Ukrainian
   project title typed into NewProjectModal still produce a clean, readable Latin
   email slug instead of an empty/garbled result (item 10). */
export const CYRILLIC_TO_LATIN: Readonly<Record<string, string>> = {
  а: "a",
  б: "b",
  в: "v",
  г: "h",
  ґ: "g",
  д: "d",
  е: "e",
  є: "ie",
  ж: "zh",
  з: "z",
  и: "y",
  і: "i",
  ї: "yi",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ь: "",
  ю: "yu",
  я: "ya",
  ъ: "",
  ы: "y",
  э: "e",
  "'": "",
  ʼ: "",
  "’": "",
};

export function transliterateCyrillic(str: string): string {
  return str
    .split("")
    .map((ch) => (ch in CYRILLIC_TO_LATIN ? CYRILLIC_TO_LATIN[ch] : ch))
    .join("");
}

export function slugifyProjectName(nameEn: string): string {
  return transliterateCyrillic((nameEn || "").toLowerCase())
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join("-");
}

export function projectEmailAddress(nameEn: string): string {
  return (slugifyProjectName(nameEn) || "project") + ".pr@rehub.org.ua";
}

/* Item 7: a project's corporate email is normally derived from its name, but can now be
   manually overridden (New/Edit Project modals) and persisted on the project object as
   `corporateEmail`. Every read site should go through this helper instead of calling
   projectEmailAddress() directly, so an edited address is reflected everywhere.
   NOTE: `nameEn` must be the project's ENGLISH name text (slugs are always Latin) --
   callers resolve it via a locale-forced translator, e.g. `i18n.getFixedT("en")(project.nameKey)`,
   never the current UI locale's `t()`. */
export function getProjectEmail(project: Project | undefined, nameEn: string): string {
  return project?.corporateEmail || projectEmailAddress(nameEn);
}

/* Item 7 (source ~lines 3895-3910): NewProjectModal/EditProjectModal both validate that a
   manually-typed corporate email isn't already claimed by another project before allowing
   submission, and normalize whatever the engineer types into the canonical
   `<slug>.pr@rehub.org.ua` shape on blur/submit. Ported as free functions here (not React
   hooks) since both modals need the exact same two operations and neither is UI. */

/** Direct port of source's `checkEmailTaken` (~lines 3902-3906). Resolves each OTHER
 * project's display email via `getProjectEmail`, which needs that project's ENGLISH name --
 * always resolved through a locale-FORCED translator (`i18n.getFixedT("en")`), never the
 * current UI locale's `t()`, same rule as `getProjectEmail`'s own doc comment. */
export function checkEmailTaken(
  email: string,
  projects: readonly Project[],
  excludeProjectId: string | null,
): boolean {
  const norm = (email || "").trim().toLowerCase();
  if (!norm) return false;
  const fixedEn = i18n.getFixedT("en");
  return projects.some(
    (p) =>
      p.id !== excludeProjectId && getProjectEmail(p, fixedEn(p.nameKey)).toLowerCase() === norm,
  );
}

/** Direct port of source's `normalizeCorporateEmail` (~lines 3908-3912). */
export function normalizeCorporateEmail(raw: string): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "";
  return /\.pr@rehub\.org\.ua$/i.test(trimmed)
    ? trimmed
    : trimmed.replace(/@.*$/, "") + ".pr@rehub.org.ua";
}
