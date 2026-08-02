/**
 * Ported from REHUB WORK V8.html, script block 1, ~lines 1160-1580.
 *
 * Bilingual `B(en, uk)` literals have been replaced by i18n keys resolved via
 * `useI18n().t(key)` -- see `src/i18n/locales/{en,uk}/norms.json`.
 */
import type { DocSentence } from "@/features/documents";
import type { InboxSeedMessage } from "@/features/inbox";

export interface FunnelOption {
  value: string;
  labelKey: string;
}

/** The AI category-detection funnel taxonomy (section -> node -> material). */
export interface Funnel {
  sections: FunnelOption[];
  nodes: Readonly<Record<string, FunnelOption[]>>;
  materials: Readonly<Record<string, FunnelOption[]>>;
}

/**
 * Legacy default source sentences/fields/comparison feeding Scenario A,
 * kept only as legacy/default data (source comment, ~line 1288-1293) so
 * anything that may still reference them doesn't break. Superseded by
 * `SUBSTITUTION_SCENARIOS["PRJ-1042"]`'s own `fields`/`table1`/`table2`.
 */
export interface LegacyAiField {
  key: string;
  labelKey: string;
  /** Plain, locale-independent value (numbers/units) -- mutually exclusive with `valueKey`. */
  value?: string;
  /** i18n key when the value itself is language-dependent text. */
  valueKey?: string;
  source: string | null;
  missing?: boolean;
}

export interface LegacyComparisonRow {
  critKey: string;
  project?: string;
  projectKey?: string;
  proposal?: string;
  proposalKey?: string;
  tone: "neutral" | "good" | "critical";
}

export type VerdictTone = "success" | "critical" | "amber";

export interface ScenarioVerdict {
  tone: VerdictTone;
  titleKey: string;
  descKey: string;
}

export interface ScenarioSource {
  key: string;
  /** Source document filename -- plain, not translated. */
  name: string;
  titleKey: string;
  sentences: readonly DocSentence[];
}

export interface ScenarioField {
  key: string;
  labelKey: string;
  /** Plain, locale-independent value (numbers/units) -- mutually exclusive with `valueKey`. */
  value?: string;
  valueKey?: string;
  sourceDoc: string | null;
  sourceKey: string | null;
  missing?: boolean;
}

export interface ScenarioTable1Row {
  critKey: string;
  specKey: string;
  limitKey: string;
  proposalKey: string;
  status: "compliant" | "violation";
  sourceDoc: string;
  sourceKey: string;
}

export interface ScenarioTable2Row {
  critKey: string;
  actual?: string;
  actualKey?: string;
  proposed?: string;
  proposedKey?: string;
  impactKey: string;
}

/**
 * A fully self-contained material-substitution scenario used by
 * SubstitutionFlow and ProjectDetail.handleResolve. 3 scenarios exist --
 * Kyiv Bridge (PRJ-1042, critical/fire-safety violation), Lviv Water
 * Treatment (PRJ-1038, amber/degraded), Dnipro Industrial Park (PRJ-1019,
 * success/recommended) -- plus one Compare-mode "extra" scenario
 * (`SUBSTITUTION_SCENARIOS_EXTRA`).
 */
export interface SubstitutionScenario {
  key: string;
  email: InboxSeedMessage;
  /** A `CategoryOption.value` (features/documents), e.g. `"facade-minvata"`. */
  category: string;
  materialShortNameKey: string;
  fromMaterialKey: string;
  toMaterialKey: string;
  supplierNameKey: string;
  costDelta: number;
  verdict: ScenarioVerdict;
  sources: ScenarioSource[];
  fields: ScenarioField[];
  table1: ScenarioTable1Row[];
  table2: ScenarioTable2Row[];
  revisionTitleKey: string;
  revisionDescKey: string;
  auditApprovedTextKey: string;
}

export interface AuditEntry {
  id: number;
  time: string;
  date: string;
  textKey: string;
  whoKey: string;
  tone: "blue" | "slate";
}

export type RevisionStatusKey = "approved" | "rejected" | "pending";

export interface RevisionEntry {
  id: number;
  titleKey: string;
  descKey: string;
  /** In-house author (direct i18n key). Mutually exclusive with `authorSupplierFromKey`. */
  authorKey?: string;
  /** For supplier-submitted pending revisions: the supplier email's `fromKey`.
   * Consumer composes the "(Supplier)" suffix via
   * `t("norms.revision.supplierAuthorSuffix", { name: t(authorSupplierFromKey) })`
   * -- this needs render-time interpolation, so only the raw key is stored here. */
  authorSupplierFromKey?: string;
  date: string;
  statusKey: RevisionStatusKey;
  isSubstitution?: boolean;
  scenarioKey?: string | null;
}

/**
 * Minimal translator shape `generateReply`/`generateReplyVariant` depend on --
 * matches `useI18n().t` (and `i18n.getFixedT(locale)` for a LOCALE-FORCED
 * translation regardless of the current UI language, which callers should use
 * here: reply drafts are generated in a specific locale, not necessarily the
 * active UI locale). Mirrors the source prototype's own `findTemplateForReport(report, t, L)`
 * pattern of accepting the translator as a parameter rather than importing a
 * hook into a non-React data module.
 */
export type Translator = (key: string, vars?: Record<string, string | number>) => string;

export type ReplyTone = "polite" | "formal" | "custom";
