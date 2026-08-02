/**
 * Ported from REHUB WORK V8.html, script block 1, ~lines 1192-1255.
 *
 * All bilingual `B(en, uk)` literals have been replaced by i18n keys under
 * the `reports.*` namespace (`src/i18n/locales/{en,uk}/reports.json`). This
 * module holds IDs, keys, structure and numbers only -- render with
 * `useI18n().t(key)`.
 */
import type {
  AnyReportTemplate,
  GenericReportTemplate,
  Report,
  ReportTemplate,
} from "@/features/reports/types";

export function makeReports(): Report[] {
  return [
    {
      id: 1,
      nameKey: "reports.seed.report.1.name",
      version: "v1.0",
      authorKey: "reports.seed.report.1.author",
      date: "02.05.2026",
      format: "PDF",
    },
    {
      id: 2,
      nameKey: "reports.seed.report.2.name",
      version: "v1.1",
      authorKey: "reports.seed.report.2.author",
      date: "14.06.2026",
      format: "XLSX",
    },
  ];
}

export const REPORT_TEMPLATES: readonly ReportTemplate[] = [
  {
    value: "material",
    key: "tpl.material",
    descKey: "tpl.materialDesc",
    accent: "blue",
    sectionsKeys: [
      "reports.template.tplMaterial.sections.substitutionSummary",
      "reports.template.tplMaterial.sections.complianceCheckDbn",
      "reports.template.tplMaterial.sections.costImpact",
      "reports.template.tplMaterial.sections.engineersVerdict",
    ],
  },
  {
    value: "monthly",
    key: "tpl.monthly",
    descKey: "tpl.monthlyDesc",
    accent: "emerald",
    sectionsKeys: [
      "reports.template.tplMonthly.sections.progressVsPlan",
      "reports.template.tplMonthly.sections.budgetBurnDown",
      "reports.template.tplMonthly.sections.riskRegister",
      "reports.template.tplMonthly.sections.nextPeriodPlan",
    ],
  },
  {
    value: "defect",
    key: "tpl.defect",
    descKey: "tpl.defectDesc",
    accent: "amber",
    sectionsKeys: [
      "reports.template.tplDefect.sections.defectList",
      "reports.template.tplDefect.sections.photoEvidence",
      "reports.template.tplDefect.sections.responsibleParty",
      "reports.template.tplDefect.sections.remediationDeadline",
    ],
  },
];

/** Fallback preview template for reports that don't match a known REPORT_TEMPLATES entry
 * (e.g. substitution reports, or the AI budget calculation report) -- used by the Reports
 * tab's View action. */
export const GENERIC_REPORT_TPL: GenericReportTemplate = {
  value: "generic",
  key: "tpl.generic",
  accent: "blue",
  sectionsKeys: [
    "reports.template.generic.sections.summary",
    "reports.template.generic.sections.keyDetails",
    "reports.template.generic.sections.notes",
  ],
};

/**
 * Ported from source's `findTemplateForReport(report, t, L)` (script block 1,
 * ~line 1253-1255), which matched by comparing TRANSLATED strings:
 * `t(tp.key) === L(report.name)`. Now that both a report's name and a
 * template's display name are i18n KEYS rather than already-resolved
 * strings, comparing the keys directly is both simpler and strictly more
 * correct (the original's string-equality comparison was locale-dependent
 * and broke if a translator ever changed either string's wording). The `t`/`L`
 * parameters are no longer needed -- flagged here as a deliberate signature
 * change for whoever wires this into a component.
 */
export function findTemplateForReport(report: Pick<Report, "nameKey">): AnyReportTemplate {
  return REPORT_TEMPLATES.find((tp) => tp.key === report.nameKey) ?? GENERIC_REPORT_TPL;
}
