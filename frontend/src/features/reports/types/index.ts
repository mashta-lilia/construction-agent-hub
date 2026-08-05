/**
 * Ported from REHUB WORK V8.html, script block 1, ~lines 1192-1255.
 *
 * Bilingual `B(en, uk)` literals (report name, author, template section
 * labels) have been replaced by i18n keys resolved via `useI18n().t(key)` --
 * see `src/i18n/locales/{en,uk}/reports.json`.
 */

export interface Report {
  id: number;
  nameKey: string;
  version: string;
  authorKey: string;
  date: string;
  format: string;
  /** Set by the caller that appends a freshly-created report (see
   * `Dashboard`'s `handleCreateReport` in the source, script block 8,
   * ~lines 4028/4143) -- renders a "New" badge next to the report name. */
  isNew?: boolean;
  /** Set alongside `isNew` for a report created in the current session --
   * renders the date column as "Just now" instead of `date`. Source used a
   * translated-string-equality hack (`t("card.lastUpdated") === "Last
   * Updated" ? "Just now" : "Щойно"`) to fake a bilingual literal without a
   * real i18n key; ported here as a proper `reports.justNow` key instead
   * (see i18n/locales/{en,uk}/reports.json), which is strictly more correct
   * under react-i18next since it doesn't depend on comparing translated
   * output of an unrelated key. */
  justNow?: boolean;
}

export interface CreateReportPayload {
  /** i18n key for the report's display name -- when created from a
   * template this is the SAME key as the template's `key`
   * (`ReportTemplateBase.key`), matching `findTemplateForReport`'s lookup. */
  nameKey: string;
  format: string;
}

export interface ReportTemplateBase {
  value: string;
  /** i18n key for the template's display name (e.g. `"tpl.material"`). When a
   * report is created FROM a template, the resulting report's `nameKey`
   * should be set to this SAME key (not a new one) -- that is what lets
   * {@link findTemplateForReport} match a report back to its template. */
  key: string;
  accent: string;
  sectionsKeys: string[];
}

export interface ReportTemplate extends ReportTemplateBase {
  descKey: string;
}

/** The fallback preview template (no description) for reports that don't match
 * a known {@link ReportTemplate}. */
export type GenericReportTemplate = ReportTemplateBase;

export type AnyReportTemplate = ReportTemplate | GenericReportTemplate;
