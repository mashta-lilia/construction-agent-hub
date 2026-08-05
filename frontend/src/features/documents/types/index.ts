/**
 * Ported from REHUB WORK V8.html, script block 1, ~lines 1153-1286.
 *
 * Bilingual `B(en, uk)` literals (document section, author, blueprint
 * discipline, category labels) have been replaced by i18n keys resolved via
 * `useI18n().t(key)` -- see `src/i18n/locales/{en,uk}/documents.json`.
 */

export interface DocSentence {
  key: string;
  textKey: string;
}

export interface ProjectDocument {
  id: number;
  /** Filename -- plain, not translated. */
  name: string;
  type: string;
  sectionKey: string;
  sizeKb: number;
  authorKey: string;
  date: string;
  /** Set by `UploadDocumentModal`/`DocumentationTab` for a document uploaded
   * in the current session (source: `d.isNew`, script block 6, ~line 2588)
   * -- renders a "New" badge next to the file name. Mirrors
   * `features/reports`' `Report.isNew`. */
  isNew?: boolean;
}

export interface Blueprint {
  id: number;
  /** Filename -- plain, not translated. */
  name: string;
  disciplineKey: string;
  revision: string;
  date: string;
}

/** Document category options used by the New Project wizard's AI auto-categorization mock. */
export interface DocCategoryOption {
  value: string;
  labelKey: string;
}

/** A single row of `BudgetCalculatorModal`'s mock cost breakdown (script
 * block 6, ~lines 2687-2694: `BUDGET_MATERIAL_ROWS`). `unit`/`unitPrice`/`qty`
 * are plain numeric/unit data (never translated in the source either);
 * `materialKey`/`supplierKey` resolve via `t()`. */
export interface BudgetMaterialRow {
  materialKey: string;
  supplierKey: string;
  unit: string;
  unitPrice: number;
  qty: number;
}

/**
 * AI auto-detected category options, derived from `FUNNEL` (features/norms).
 * The original prototype precomputed a single concatenated bilingual label
 * (`node.label + " / " + material.label`) at module-load time; since labels
 * are now i18n keys rather than already-resolved strings, that concatenation
 * can only happen at render time. Consumers do
 * `t(nodeLabelKey) + " / " + t(materialLabelKey)` instead of reading a single
 * precomputed `labelKey`. Flagged as a deliberate adaptation, not a guess.
 */
export interface CategoryOption {
  /** `"<nodeValue>-<materialValue>"`, e.g. `"facade-minvata"`. */
  value: string;
  nodeLabelKey: string;
  materialLabelKey: string;
}
