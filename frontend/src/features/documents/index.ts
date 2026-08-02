export type {
  Blueprint,
  BudgetMaterialRow,
  CategoryOption,
  DocCategoryOption,
  DocSentence,
  ProjectDocument,
} from "./types";

export {
  AI_DETECTED_CATEGORY,
  BUDGET_MATERIAL_ROWS,
  BUDGET_SOURCE_DOC_TITLE_KEY,
  BUDGET_SOURCE_LINES,
  CATEGORY_OPTIONS,
  DOC_CATEGORY_OPTIONS,
  DOC_SENTENCES,
  guessDocCategory,
  makeBlueprints,
  makeDocuments,
} from "./constants/data";

/* Per CLAUDE-WORKFLOW.md §2.1, other layers only import a feature through
 * its barrel, never its internal `components/...` path directly. */
export { UploadDocumentModal } from "./components/UploadDocumentModal/UploadDocumentModal";
export type { UploadDocumentModalProps } from "./components/UploadDocumentModal/UploadDocumentModal";
export { DocumentationTab } from "./components/DocumentationTab/DocumentationTab";
export type { DocumentationTabProps } from "./components/DocumentationTab/DocumentationTab";
export { BudgetCalculatorModal } from "./components/BudgetCalculatorModal/BudgetCalculatorModal";
export type { BudgetCalculatorModalProps } from "./components/BudgetCalculatorModal/BudgetCalculatorModal";
export { BlueprintsTab } from "./components/BlueprintsTab/BlueprintsTab";
export type { BlueprintsTabProps } from "./components/BlueprintsTab/BlueprintsTab";
