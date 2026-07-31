import type { LucideIcon } from 'lucide-react';

import type { TranslationKey } from '@/i18n/locales/en';

/* i18n primitives are re-exported so features can import everything from "@/types". */
export type { Locale } from '@/i18n/config';
export type { TranslationDictionary, TranslationKey } from '@/i18n/locales/en';

/* =============================================================================
 * Bilingual primitives
 * ---------------------------------------------------------------------------
 * The prototype stores every user-facing string as `B(en, uk)`. Some fields
 * legitimately hold a locale-independent literal instead (numbers, units,
 * prices: "0.041", "$480/m²"), so those are typed as `Localizable`.
 * ========================================================================== */

export interface BilingualString {
  en: string;
  uk: string;
}

/** A value that is either localized or the same in every locale. */
export type Localizable = BilingualString | string;

/** Generic `<Select>` / `<MultiSelect>` option with a localized label. */
export interface BilingualOption {
  value: string;
  label: BilingualString;
}

/* =============================================================================
 * Domain enums
 * ========================================================================== */

/** Project stage — doubles as the `status.*` i18n key and drives `StatusBadge`. */
export type ProjectStage = 'planning' | 'inProgress' | 'audit' | 'onHold' | 'completed';

export type RiskLevel = 'green' | 'amber' | 'red';

/** Accent used by feed items, audit rows and badges. */
export type Tone = 'blue' | 'green' | 'amber' | 'red' | 'slate';

/** Verdict severity of an AI substitution analysis. */
export type VerdictTone = 'success' | 'amber' | 'critical';

/** Row-level outcome in the DBN compliance table. */
export type ComplianceStatus = 'compliant' | 'violation';

export type RevisionStatus = 'approved' | 'pending' | 'rejected';

/** Engineer's decision on a pending substitution; `null` until resolved. */
export type Resolution = 'approved' | 'rejected' | null;

export type ReportFormat = 'PDF' | 'XLSX';

/** Category assigned by the New Project wizard's auto-categorization mock. */
export type DocumentCategory = 'report' | 'documentation' | 'blueprint' | 'correction';

/**
 * Known document types, while still accepting an arbitrary extension derived
 * from an uploaded filename. `string & {}` keeps literal autocomplete alive.
 */
export type DocumentFileType = 'PDF' | 'XLSX' | 'DOCX' | 'DWG' | 'FILE' | (string & {});

/* =============================================================================
 * Projects
 * ========================================================================== */

export interface Project {
  id: string;
  name: BilingualString;
  /** Stage of work — same field the table's Stage column reads. */
  statusKey: ProjectStage;
  /** `null` renders as "TBD" / "Визначається". */
  budget: number | null;
  updated: BilingualString;
  hasAlert: boolean;
  client: BilingualString;
  leadEngineer: BilingualString;
  location: BilingualString;
  deadline: BilingualString;
  risk: RiskLevel;
  phase: BilingualString;
  /** Enables the seeded substitution scenario for this project. */
  hasDemo: boolean;
  /** Engineers with access; matched by value against `ENGINEERS`. */
  team: BilingualString[];
  /** Manual override of the auto-derived corporate mailbox address. */
  corporateEmail?: string;
}

/** Draft payload emitted by the New / Edit Project modals. */
export type ProjectDraft = Omit<Project, 'id' | 'updated' | 'hasAlert' | 'hasDemo'>;

export type ProjectFilter = 'active' | 'onHold' | 'completed';

/* =============================================================================
 * Mail
 * ========================================================================== */

export interface EmailBase {
  initials: string;
  from: BilingualString;
  company: BilingualString;
  email: string;
  subject: BilingualString;
  preview: BilingualString;
  received: BilingualString;
  body: BilingualString;
}

/** Supplier email seeded per scenario (no id until placed in an inbox). */
export type SupplierEmail = EmailBase;

export interface InboxMessage extends EmailBase {
  id: string;
  unread?: boolean;
  /** Renders the "Start substitution analysis" trigger on the row. */
  hasSubstitution?: boolean;
}

export interface InboxSeed {
  /** Surfaced only when the owning project is flagged `hasDemo`. */
  substitution?: SupplierEmail;
  messages: InboxMessage[];
}

export type MailFolderKey = 'inbox' | 'sent' | 'spam';

/* =============================================================================
 * Project artifacts
 * ========================================================================== */

export interface ProjectDocument {
  id: number;
  name: string;
  type: DocumentFileType;
  section: BilingualString;
  sizeKb: number;
  author: BilingualString;
  date: string;
  /** Highlights a row created during the current session. */
  isNew?: boolean;
}

export interface Blueprint {
  id: number;
  name: string;
  discipline: BilingualString;
  revision: string;
  date: string;
  isNew?: boolean;
}

export interface Report {
  id: number;
  name: BilingualString;
  version: string;
  author: BilingualString;
  date: string;
  format: ReportFormat;
  /** Renders "Just now" / "Щойно" instead of the date. */
  justNow?: boolean;
  isNew?: boolean;
}

export interface AuditEntry {
  id: number;
  time: string;
  date: string;
  text: BilingualString;
  who: BilingualString;
  tone: Tone;
}

export interface Revision {
  id: number;
  title: BilingualString;
  desc: BilingualString;
  author: BilingualString;
  date: string;
  statusKey: RevisionStatus;
  isSubstitution?: boolean;
}

/** File picked in an upload dropzone, before it becomes a `ProjectDocument`. */
export interface UploadedFile {
  id: number;
  name: string;
  sizeKb: number;
  category?: DocumentCategory;
}

/** Per-project state slice, created lazily the first time a project is opened. */
export interface ProjectData {
  documents: ProjectDocument[];
  blueprints: Blueprint[];
  reports: Report[];
  audit: AuditEntry[];
  revisions: Revision[];
  inboxMessages: InboxMessage[];
  sentMessages: InboxMessage[];
  spamMessages: InboxMessage[];
  resolution: Resolution;
}

/* =============================================================================
 * Substitution analysis
 * ========================================================================== */

export interface DocSentence {
  key: string;
  text: BilingualString;
}

/** Source document shown in the tracing viewer; sentences are citable by key. */
export interface SourceDocument {
  key: string;
  name: string;
  title: BilingualString;
  sentences: DocSentence[];
}

/** Field extracted by the AI, traced back to `sourceDoc` → `sourceKey`. */
export interface ExtractedField {
  key: string;
  labelKey: TranslationKey;
  value: Localizable;
  sourceDoc: string | null;
  sourceKey: string | null;
  /** No value found in the documentation. */
  missing?: boolean;
}

/** Row of the "project spec vs. norm vs. proposal" compliance table. */
export interface ComplianceRow {
  crit: BilingualString;
  spec: Localizable;
  limit: Localizable;
  proposal: Localizable;
  status: ComplianceStatus;
  sourceDoc: string | null;
  sourceKey: string | null;
}

/** Row of the "actual vs. proposed" impact table. */
export interface ImpactRow {
  crit: BilingualString;
  actual: Localizable;
  proposed: Localizable;
  impact: Localizable;
}

/**
 * The verdict is always a recommendation, never a decision: the engineer
 * confirms every substitution personally and the confirmation is written to the
 * audit log (spec risk table, row 1). UI must label it as such.
 */
export interface Verdict {
  tone: VerdictTone;
  title: BilingualString;
  desc: BilingualString;
}

export interface SubstitutionScenario {
  key: string;
  email: SupplierEmail;
  /** Value from `CATEGORY_OPTIONS` (`<node>-<material>`). */
  category: string;
  materialShortName: BilingualString;
  fromMaterial: BilingualString;
  toMaterial: BilingualString;
  supplierName: BilingualString;
  /** Negative = the proposal is cheaper. */
  costDelta: number;
  verdict: Verdict;
  sources: SourceDocument[];
  fields: ExtractedField[];
  /** DBN compliance table. */
  table1: ComplianceRow[];
  /** Cost / quality impact table. */
  table2: ImpactRow[];
  revisionTitle: BilingualString;
  revisionDesc: BilingualString;
  auditApprovedText: BilingualString;
}

/** Tone of an AI-generated reply draft. */
export type ReplyTone = 'neutral' | 'firm' | 'soft' | 'custom';

/* =============================================================================
 * Material funnel (section → node → material taxonomy)
 * ========================================================================== */

export interface FunnelEntry {
  value: string;
  label: BilingualString;
}

export interface Funnel {
  sections: FunnelEntry[];
  /** Keyed by section value. */
  nodes: Record<string, FunnelEntry[]>;
  /** Keyed by node value. */
  materials: Record<string, FunnelEntry[]>;
}

/* =============================================================================
 * Reports & budget
 * ========================================================================== */

export type TemplateAccent = 'blue' | 'emerald' | 'amber';

export interface ReportTemplate {
  value: string;
  /** i18n key of the template name. */
  key: TranslationKey;
  /** i18n key of the description; absent on the generic fallback. */
  descKey?: TranslationKey;
  accent: TemplateAccent;
  sections: BilingualString[];
}

export interface BudgetMaterialRow {
  material: BilingualString;
  supplier: BilingualString;
  unit: string;
  unitPrice: number;
  qty: number;
}

/* =============================================================================
 * Feeds & navigation
 * ========================================================================== */

/** Notification bell item and activity feed row (text resolved via i18n keys). */
export interface FeedItem {
  id: number;
  textKey: TranslationKey;
  timeKey: TranslationKey;
  icon: LucideIcon;
  tone: Tone;
}

export type NavAction = 'openMail' | 'openActivity';

export interface NavChild {
  labelKey: TranslationKey;
  filter: ProjectFilter;
}

export interface NavItem {
  labelKey: TranslationKey;
  icon: LucideIcon;
  expandable: boolean;
  defaultOpen?: boolean;
  /** Clicking resets the active project filter. */
  resetsFilter?: boolean;
  children?: NavChild[];
  action?: NavAction;
}

export type ProjectTabKey =
  'documentation' | 'reports' | 'blueprints' | 'revisions' | 'audit' | 'inbox';

export interface TabDef {
  key: ProjectTabKey;
  labelKey: TranslationKey;
  icon: LucideIcon;
}

export type DocFolderKey = 'permits' | 'finance' | 'blueprints' | 'other';

export interface FolderDef {
  key: DocFolderKey;
  labelKey: TranslationKey;
}

export interface MailFolderDef {
  key: MailFolderKey;
  labelKey: TranslationKey;
}

/* =============================================================================
 * Localization
 * ---------------------------------------------------------------------------
 * `TranslationKey` / `Dictionary` are derived from the `en` dictionary in
 * `lib/dictionaries.ts` and re-exported at the top of this file, so `t()`
 * cannot be called with a key that does not exist.
 * ========================================================================== */

/** Interpolation values for `t("key", { count: 3 })` → "{count}". */
export type TranslationVars = Record<string, string | number>;

/* =============================================================================
 * Normative base (ДБН / ДСТУ) — spec §2.3 item 3, §7.3
 * ---------------------------------------------------------------------------
 * Absent from the prototype: it has no screen for uploading state building
 * norms. `assisted` is the semi-automatic mode where the engineer reviews the
 * recognised draft before it is used for comparisons; `auto` skips the review.
 * ========================================================================== */

export type RecognitionMode = 'auto' | 'assisted';

export type RecognitionStatus = 'queued' | 'processing' | 'review' | 'confirmed' | 'failed';

export interface NormativeRequirement {
  id: string;
  /** Clause the limit comes from, e.g. "п. 5.4.2". */
  clause: string;
  criterion: BilingualString;
  limit: Localizable;
  unit?: string;
  /** Set once the engineer confirms or edits the recognised value. */
  confirmedBy?: BilingualString;
  /** Sentence key inside the source document, for tracing. */
  sourceKey?: string;
}

export interface NormativeDocument {
  id: string;
  /** Official designation, e.g. "ДБН В.1.1-7:2016". */
  code: string;
  title: BilingualString;
  fileName: string;
  sizeKb: number;
  uploadedAt: string;
  uploadedBy: BilingualString;
  mode: RecognitionMode;
  status: RecognitionStatus;
  /** Editable while `status === "review"`, read-only once confirmed. */
  requirements: NormativeRequirement[];
}

/* =============================================================================
 * Background processing — spec §2.3 item 5, §4.2
 * ---------------------------------------------------------------------------
 * Recognition and letter analysis run on a queue (Redis + ARQ) and must not
 * block the UI, so every long-running action is represented as a job the
 * interface polls rather than an awaited request.
 * ========================================================================== */

export type JobKind = 'normative-recognition' | 'letter-analysis' | 'report-generation';

export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export interface ProcessingJob {
  id: string;
  projectId: string;
  kind: JobKind;
  status: JobStatus;
  /** 0–100 when the backend reports it. */
  progress?: number;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
}

/* =============================================================================
 * Sensitive-data masking — spec §2.3 item 9 and the risk table
 * ---------------------------------------------------------------------------
 * Object names, locations and amounts must be stripped before anything is sent
 * to the external AI service. The UI has to show what was replaced, otherwise
 * the requirement is unverifiable for the engineer.
 * ========================================================================== */

export type MaskedFieldKind = 'projectName' | 'location' | 'client' | 'amount' | 'person';

export interface MaskedField {
  kind: MaskedFieldKind;
  original: string;
  /** What the AI service sees instead, e.g. "[OBJECT_1]". */
  placeholder: string;
}

export interface MaskingReport {
  fields: MaskedField[];
  maskedAt: string;
}

/* =============================================================================
 * Report versioning — spec §2.3 item 8
 * ---------------------------------------------------------------------------
 * Each edit creates a new version; earlier ones are never rewritten.
 * ========================================================================== */

export interface ReportVersion {
  version: string;
  createdAt: string;
  author: BilingualString;
  /** Immutable snapshot of what the report said at this version. */
  snapshot: {
    verdict: Verdict;
    compliance: ComplianceRow[];
    impact: ImpactRow[];
    replyDraft: BilingualString;
  };
}

/** Supplier stock status — the "наявність" comparison criterion of §2.3 item 6. */
export type AvailabilityStatus = 'inStock' | 'onOrder' | 'unavailable';

/* =============================================================================
 * UI plumbing
 * ========================================================================== */

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
  onUndo?: () => void;
}

export type SortDirection = 'asc' | 'desc';
