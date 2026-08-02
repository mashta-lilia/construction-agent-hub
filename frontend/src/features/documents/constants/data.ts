/**
 * Ported from REHUB WORK V8.html, script block 1, ~lines 1153-1286.
 *
 * All bilingual `B(en, uk)` literals have been replaced by i18n keys under
 * the `documents.*` namespace (`src/i18n/locales/{en,uk}/documents.json`).
 * This module holds IDs, keys, structure and numbers only -- render with
 * `useI18n().t(key)`.
 */
import { FUNNEL, DOC_SENTENCES } from "@/features/norms";
import type {
  Blueprint,
  BudgetMaterialRow,
  CategoryOption,
  DocCategoryOption,
  ProjectDocument,
} from "@/features/documents/types";

/**
 * Re-exported from `features/norms/constants/data.ts`, which now owns the
 * actual literal (see the comment there for why): `features/norms` needed
 * this data too, and having BOTH features import a runtime VALUE from each
 * other (`documents -> norms` for `FUNNEL` here, `norms -> documents` for
 * this) is a circular import that throws `ReferenceError: Cannot access
 * 'DOC_SENTENCES' before initialization` at load time depending on module
 * evaluation order. Re-exporting keeps this module's own public API
 * (`@/features/documents`'s `DOC_SENTENCES`) unchanged for any existing
 * caller.
 */
export { DOC_SENTENCES };

export function makeDocuments(): ProjectDocument[] {
  return [
    {
      id: 1,
      name: "DBN_V.2.6-31.pdf",
      type: "PDF",
      sectionKey: "documents.seed.document.1.section",
      sizeKb: 3200,
      authorKey: "documents.seed.document.1.author",
      date: "01.06.2026",
    },
    {
      id: 2,
      name: "Estimate_Q2.xlsx",
      type: "XLSX",
      sectionKey: "documents.seed.document.2.section",
      sizeKb: 540,
      authorKey: "documents.seed.document.2.author",
      date: "18.06.2026",
    },
    {
      id: 3,
      name: "Facade_requirements.docx",
      type: "DOCX",
      sectionKey: "documents.seed.document.3.section",
      sizeKb: 890,
      authorKey: "documents.seed.document.3.author",
      date: "22.05.2026",
    },
    {
      id: 4,
      name: "Node_A_fastening.pdf",
      type: "PDF",
      sectionKey: "documents.seed.document.4.section",
      sizeKb: 640,
      authorKey: "documents.seed.document.4.author",
      date: "10.06.2026",
    },
  ];
}

export function makeBlueprints(): Blueprint[] {
  return [
    {
      id: 1,
      name: "Facade_insulation_F4-F7.dwg",
      disciplineKey: "documents.seed.blueprint.1.discipline",
      revision: "Rev 4",
      date: "10.06.2026",
    },
    {
      id: 2,
      name: "Foundation_layout.dwg",
      disciplineKey: "documents.seed.blueprint.2.discipline",
      revision: "Rev 2",
      date: "14.03.2026",
    },
    {
      id: 3,
      name: "Site_drainage.dwg",
      disciplineKey: "documents.seed.blueprint.3.discipline",
      revision: "Rev 1",
      date: "27.02.2026",
    },
    {
      id: 4,
      name: "Electrical_riser.dwg",
      disciplineKey: "documents.seed.blueprint.4.discipline",
      revision: "Rev 3",
      date: "05.05.2026",
    },
  ];
}

export const DOC_CATEGORY_OPTIONS: readonly DocCategoryOption[] = [
  { value: "report", labelKey: "documents.categoryOption.report.label" },
  { value: "documentation", labelKey: "documents.categoryOption.documentation.label" },
  { value: "blueprint", labelKey: "documents.categoryOption.blueprint.label" },
  { value: "correction", labelKey: "documents.categoryOption.correction.label" },
];

/** Faithful port of the source's filename-sniffing heuristic (script block 1, ~line
 * 1264-1272), including its pre-existing `/report|звіт|звіт/i` duplicate alternative --
 * kept byte-for-byte rather than "fixed" so behavior stays identical to the prototype. */
export function guessDocCategory(filename: string): string {
  const m = /\.([a-zA-Z0-9]+)$/.exec(filename);
  const ext = m?.[1]?.toLowerCase() ?? "";
  if (ext === "dwg" || ext === "dxf") return "blueprint";
  if (/report|звіт|звіт/i.test(filename)) return "report";
  if (ext === "pdf" || ext === "xlsx" || ext === "xls") return "report";
  if (/correct|виправ/i.test(filename)) return "correction";
  return "documentation";
}

/** AI auto-detected category options (derived from the FUNNEL taxonomy, features/norms). */
export const CATEGORY_OPTIONS: readonly CategoryOption[] = FUNNEL.sections.flatMap((section) =>
  (FUNNEL.nodes[section.value] ?? []).flatMap((node) =>
    (FUNNEL.materials[node.value] ?? []).map((material) => ({
      value: `${node.value}-${material.value}`,
      nodeLabelKey: node.labelKey,
      materialLabelKey: material.labelKey,
    })),
  ),
);

export const AI_DETECTED_CATEGORY = "facade-minvata";

/**
 * Mock cost breakdown backing `BudgetCalculatorModal`'s step-3 results table.
 * Ported from REHUB WORK V8.html, script block 6, ~lines 2687-2694
 * (`BUDGET_MATERIAL_ROWS`). `unit`/`unitPrice`/`qty` are plain data (never
 * translated in the source); `materialKey`/`supplierKey` are new i18n keys
 * under the `documents.budget.row.*` namespace holding the source's actual
 * `B(en, uk)` literals verbatim.
 */
export const BUDGET_MATERIAL_ROWS: readonly BudgetMaterialRow[] = [
  {
    materialKey: "documents.budget.row.concrete.material",
    supplierKey: "documents.budget.row.concrete.supplier",
    unit: "m³",
    unitPrice: 95,
    qty: 420,
  },
  {
    materialKey: "documents.budget.row.rebar.material",
    supplierKey: "documents.budget.row.rebar.supplier",
    unit: "t",
    unitPrice: 780,
    qty: 38,
  },
  {
    materialKey: "documents.budget.row.wool.material",
    supplierKey: "documents.budget.row.wool.supplier",
    unit: "m³",
    unitPrice: 42,
    qty: 260,
  },
  {
    materialKey: "documents.budget.row.brick.material",
    supplierKey: "documents.budget.row.brick.supplier",
    unit: "pcs",
    unitPrice: 0.65,
    qty: 18500,
  },
  {
    materialKey: "documents.budget.row.membrane.material",
    supplierKey: "documents.budget.row.membrane.supplier",
    unit: "m²",
    unitPrice: 12.5,
    qty: 1200,
  },
  {
    materialKey: "documents.budget.row.beams.material",
    supplierKey: "documents.budget.row.beams.supplier",
    unit: "pcs",
    unitPrice: 1450,
    qty: 24,
  },
];

/** i18n key for the mock source document title backing the "Sources &
 * Tracing" panel (source `BUDGET_SOURCE_DOC_TITLE`, ~line 2696). */
export const BUDGET_SOURCE_DOC_TITLE_KEY = "documents.budget.source.title";

/**
 * One excerpt line per `BUDGET_MATERIAL_ROWS` entry, same order -- clicking
 * a row's material name, unit price, or quantity cell pins that row's line,
 * highlighted, in the left-hand viewer (source `BUDGET_SOURCE_LINES`,
 * ~lines 2697-2704).
 */
export const BUDGET_SOURCE_LINES: readonly string[] = [
  "documents.budget.source.line.concrete",
  "documents.budget.source.line.rebar",
  "documents.budget.source.line.wool",
  "documents.budget.source.line.brick",
  "documents.budget.source.line.membrane",
  "documents.budget.source.line.beams",
];
