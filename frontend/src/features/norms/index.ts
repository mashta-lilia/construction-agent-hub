export type {
  AuditEntry,
  Funnel,
  FunnelOption,
  LegacyAiField,
  LegacyComparisonRow,
  ReplyTone,
  RevisionEntry,
  RevisionStatusKey,
  ScenarioField,
  ScenarioSource,
  ScenarioTable1Row,
  ScenarioTable2Row,
  ScenarioVerdict,
  SubstitutionScenario,
  Translator,
  VerdictTone,
} from "./types";

export {
  AI_FIELDS,
  COMPARISON,
  DOC_SENTENCES,
  FUNNEL,
  SUBSTITUTION_SCENARIOS,
  SUBSTITUTION_SCENARIOS_EXTRA,
  generateReply,
  generateReplyVariant,
  getScenario,
  makeAudit,
  makeRevisions,
} from "./constants/data";

export { SubstitutionFlow } from "./components/SubstitutionFlow/SubstitutionFlow";
export type { SubstitutionFlowProps } from "./components/SubstitutionFlow/SubstitutionFlow";
export type {
  ConfirmKind,
  EditableField,
  SourceRef,
} from "./components/SubstitutionFlow/SubstitutionFlow.types";
export { resolveKeyedText } from "./components/SubstitutionFlow/utils";

export { RevisionsTab } from "./components/RevisionsTab/RevisionsTab";
export type { RevisionsTabProps } from "./components/RevisionsTab/RevisionsTab";

export { CompareSubstitutionsDialog } from "./components/CompareSubstitutionsDialog/CompareSubstitutionsDialog";
export type { CompareSubstitutionsDialogProps } from "./components/CompareSubstitutionsDialog/CompareSubstitutionsDialog";
