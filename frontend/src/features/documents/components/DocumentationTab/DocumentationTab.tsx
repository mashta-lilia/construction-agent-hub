import { useMemo, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { cx } from "@/lib/cx";
import { formatSize } from "@/lib/format";
import { downloadBlob, makeDummyContent } from "@/lib/download";
import { useSortableData } from "@/hooks/useSortableData";
import { Card, CardHeader, CardTitle } from "@/components/Card/Card";
import { Badge, type BadgeVariant } from "@/components/Badge/Badge";
import { Button } from "@/components/Button/Button";
import { Select } from "@/components/Select/Select";
import { SortHeader } from "@/components/SortHeader/SortHeader";
import { Sheet } from "@/components/Sheet/Sheet";
import { DialogHeader } from "@/components/Dialog/Dialog";
import {
  Calculator,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Filter,
  Folder,
  LayoutGrid,
  ListIcon,
  UploadCloud,
  X,
} from "@/components/Icon/icons";
import { UploadDocumentModal } from "@/features/documents/components/UploadDocumentModal/UploadDocumentModal";
import { BudgetCalculatorModal } from "@/features/documents/components/BudgetCalculatorModal/BudgetCalculatorModal";
import { DOC_SENTENCES } from "@/features/documents/constants/data";
import type { ProjectDocument } from "@/features/documents/types";
import type { Project } from "@/features/projects";
import type { Report } from "@/features/reports";
import "@/features/documents/documents.css";

/**
 * Ported from REHUB WORK V8.html, script block 6, lines ~2457-2697
 * (`FOLDER_DEFS`, `folderOfDocument`, `ViewToggle`, `DocumentationTab`).
 *
 * Folder system (List/Grid toggle at both the folder-grid level and the
 * inside-folder file-list level), drag-and-drop upload wired to
 * `UploadDocumentModal`, and the entry point for `BudgetCalculatorModal`.
 */

type FolderKey = "permits" | "finance" | "blueprints" | "other";

interface FolderDef {
  key: FolderKey;
  labelKey: string;
}

const FOLDER_DEFS: FolderDef[] = [
  { key: "permits", labelKey: "folders.permits" },
  { key: "finance", labelKey: "folders.finance" },
  { key: "blueprints", labelKey: "folders.blueprints" },
  { key: "other", labelKey: "folders.other" },
];

/**
 * Source classified by the resolved `section.en` bilingual string (`"DBN"`
 * filename sniff, `"Finance"`, `"Facade"`/`"Structures"`). Now that
 * `ProjectDocument.sectionKey` is an i18n KEY rather than a resolved string,
 * this compares against the specific seed keys that used to resolve to
 * those English labels (`features/documents/constants/data.ts`'s
 * `makeDocuments()`, `documents.seed.document.{2,3,4}.section`). A document
 * whose `sectionKey` doesn't match one of these known seed keys (e.g. a
 * freshly uploaded file, whose `sectionKey` is one of the
 * `DOC_CATEGORY_OPTIONS` labels) falls into "other", same as the source's
 * behavior for any section string it didn't recognize.
 */
function folderOfDocument(d: ProjectDocument): FolderKey {
  if (/DBN/i.test(d.name)) return "permits";
  if (d.sectionKey === "documents.seed.document.2.section") return "finance";
  if (
    d.sectionKey === "documents.seed.document.3.section" ||
    d.sectionKey === "documents.seed.document.4.section"
  ) {
    return "blueprints";
  }
  return "other";
}

type ViewMode = "list" | "grid";

/** Small list/grid toggle button group reused at both the folder-grid and
 * inside-folder file-list levels. */
function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) {
  const { t } = useI18n();
  return (
    <div className="rh-doc-view-toggle">
      <button
        type="button"
        onClick={() => onChange("list")}
        title={t("view.list")}
        aria-label={t("view.list")}
        className={cx("rh-doc-view-toggle-btn", mode === "list" && "rh-doc-view-toggle-btn-active")}
      >
        <ListIcon size={16} />
      </button>
      <button
        type="button"
        onClick={() => onChange("grid")}
        title={t("view.grid")}
        aria-label={t("view.grid")}
        className={cx("rh-doc-view-toggle-btn", mode === "grid" && "rh-doc-view-toggle-btn-active")}
      >
        <LayoutGrid size={16} />
      </button>
    </div>
  );
}

const TYPE_BADGE: Record<string, BadgeVariant> = { PDF: "red", XLSX: "green", DOCX: "blue" };

export interface DocumentationTabProps {
  documents: ProjectDocument[];
  onUpload: (docs: ProjectDocument[]) => void;
  project?: Project;
  onUpdateProject?: (patch: Partial<Project>) => void;
  setReports?: (updater: Report[] | ((prev: Report[]) => Report[])) => void;
}

export function DocumentationTab({
  documents,
  onUpload,
  project,
  onUpdateProject,
  setReports,
}: DocumentationTabProps) {
  const { t } = useI18n();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [viewing, setViewing] = useState<ProjectDocument | null>(null);
  const [activeFolder, setActiveFolder] = useState<FolderKey | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const folderCounts = useMemo(() => {
    const counts: Record<FolderKey, number> = { permits: 0, finance: 0, blueprints: 0, other: 0 };
    documents.forEach((d) => {
      counts[folderOfDocument(d)]++;
    });
    return counts;
  }, [documents]);
  const folderDocs = useMemo(
    () =>
      activeFolder ? documents.filter((d) => folderOfDocument(d) === activeFolder) : documents,
    [documents, activeFolder],
  );
  const currentFolderDef = FOLDER_DEFS.find((f) => f.key === activeFolder);

  const typeOptions = useMemo(() => {
    const uniq = Array.from(new Set(folderDocs.map((d) => d.type)));
    return [
      { value: "all", label: t("filter.all") },
      ...uniq.map((ty) => ({ value: ty, label: ty })),
    ];
  }, [folderDocs, t]);
  const sectionOptions = useMemo(() => {
    const uniq = Array.from(new Set(folderDocs.map((d) => d.sectionKey)));
    return [
      { value: "all", label: t("filter.all") },
      ...uniq.map((key) => ({ value: key, label: t(key) })),
    ];
  }, [folderDocs, t]);

  const filtered = folderDocs.filter(
    (d) =>
      (typeFilter === "all" || d.type === typeFilter) &&
      (sectionFilter === "all" || d.sectionKey === sectionFilter),
  );
  /* `useSortableData<T extends Record<string, unknown>>` needs an explicit
   * index-signature-compatible type argument under project-mode `tsc -b`
   * (plain interfaces like `ProjectDocument` aren't structurally assignable
   * to `Record<string, unknown>` without one) -- this local cast satisfies
   * the hook's generic constraint without changing the shared
   * `ProjectDocument` type or the hook itself. Same pre-existing constraint
   * mismatch is independently hit by `features/reports`' `ReportsTab` and
   * this feature's own `BlueprintsTab`. */
  const { sorted, sortKey, sortDir, requestSort } = useSortableData(
    filtered as (ProjectDocument & Record<string, unknown>)[],
    "date",
    "desc",
  );
  const hasActiveFilters = typeFilter !== "all" || sectionFilter !== "all";

  return (
    <div>
      {!activeFolder && (
        <div className="rh-doc-toolbar">
          <div className="rh-doc-toolbar-title">{t("folders.root")}</div>
          <div className="rh-doc-toolbar-actions">
            {project && (
              <Button variant="primary" size="sm" onClick={() => setCalcOpen(true)}>
                <Calculator size={14} /> {t("doc.calcBudget")}
              </Button>
            )}
            <ViewToggle mode={viewMode} onChange={setViewMode} />
            <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>
              <UploadCloud size={14} /> {t("doc.upload")}
            </Button>
          </div>
        </div>
      )}

      {!activeFolder &&
        (viewMode === "grid" ? (
          <div className="rh-doc-folder-grid">
            {FOLDER_DEFS.map((f) => (
              <Card
                key={f.key}
                onClick={() => setActiveFolder(f.key)}
                className="rh-doc-folder-card"
              >
                <div className="rh-doc-folder-icon-wrap">
                  <Folder size={32} className="rh-doc-folder-icon" />
                </div>
                <div className="rh-doc-folder-name">{t(f.labelKey)}</div>
                <div className="rh-doc-folder-count">
                  {t("folders.count", { n: folderCounts[f.key] })}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rh-doc-table-card rh-doc-folder-list-card">
            <table className="rh-doc-table">
              <thead>
                <tr>
                  <th className="rh-doc-table-head">{t("folders.root")}</th>
                  <th className="rh-doc-table-head rh-doc-table-head-narrow" />
                </tr>
              </thead>
              <tbody>
                {FOLDER_DEFS.map((f) => (
                  <tr
                    key={f.key}
                    onClick={() => setActiveFolder(f.key)}
                    className="rh-doc-folder-row"
                  >
                    <td className="rh-doc-table-cell">
                      <div className="rh-doc-table-name">
                        <Folder size={16} className="rh-doc-folder-row-icon" /> {t(f.labelKey)}
                      </div>
                    </td>
                    <td className="rh-doc-table-cell rh-doc-table-muted rh-doc-table-num">
                      {t("folders.count", { n: folderCounts[f.key] })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}

      {activeFolder && (
        <>
          <div className="rh-doc-breadcrumb">
            <button onClick={() => setActiveFolder(null)} className="rh-doc-breadcrumb-link">
              {t("folders.root")}
            </button>
            <ChevronRight size={14} className="rh-doc-breadcrumb-sep" />
            <span className="rh-doc-breadcrumb-current">
              {currentFolderDef ? t(currentFolderDef.labelKey) : ""}
            </span>
          </div>

          <div className="rh-doc-filters">
            <div>
              <div className="rh-doc-filter-label">
                <Filter size={14} /> {t("filter.format")}
              </div>
              <Select
                value={typeFilter}
                onChange={setTypeFilter}
                options={typeOptions}
                className="rh-doc-select-format"
              />
            </div>
            <div>
              <div className="rh-doc-filter-label">{t("filter.section")}</div>
              <Select
                value={sectionFilter}
                onChange={setSectionFilter}
                options={sectionOptions}
                className="rh-doc-select-section"
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTypeFilter("all");
                  setSectionFilter("all");
                }}
              >
                <X size={14} /> {t("filter.clear")}
              </Button>
            )}
            <div className="rh-doc-filters-spacer" />
            <ViewToggle mode={viewMode} onChange={setViewMode} />
            <Button variant="primary" size="sm" onClick={() => setUploadOpen(true)}>
              <UploadCloud size={14} /> {t("doc.upload")}
            </Button>
          </div>

          {viewMode === "grid" ? (
            <div>
              <div className="rh-doc-grid-header">
                <div className="rh-doc-grid-title">{t("doc.title")}</div>
                <span className="rh-doc-table-muted">{t("doc.count", { n: filtered.length })}</span>
              </div>
              <div className="rh-doc-file-grid">
                {sorted.map((d) => (
                  <Card key={d.id} onClick={() => setViewing(d)} className="rh-doc-file-card">
                    <div className="rh-doc-file-icon-wrap">
                      <FileText size={28} className="rh-doc-file-icon" />
                    </div>
                    <div className="rh-doc-file-name" title={d.name}>
                      {d.name}
                    </div>
                    {d.isNew && (
                      <Badge variant="green" className="rh-doc-file-new-badge">
                        {t("documents.badge.new")}
                      </Badge>
                    )}
                    <div className="rh-doc-table-muted rh-doc-file-meta">
                      {d.type} · {formatSize(d.sizeKb)}
                    </div>
                    <div className="rh-doc-table-muted rh-doc-file-date">{d.date}</div>
                  </Card>
                ))}
                {sorted.length === 0 &&
                  (folderDocs.length === 0 ? (
                    <div className="rh-doc-empty-state">
                      <div className="rh-doc-empty-icon-wrap">
                        <FileText size={24} className="rh-doc-empty-icon" />
                      </div>
                      <div className="rh-doc-empty-title">{t("folders.emptyTitle")}</div>
                      <div className="rh-doc-empty-desc">{t("folders.empty")}</div>
                      <Button variant="primary" size="sm" onClick={() => setUploadOpen(true)}>
                        <UploadCloud size={14} /> {t("doc.upload")}
                      </Button>
                    </div>
                  ) : (
                    <div className="rh-doc-no-results">{t("filter.noResults")}</div>
                  ))}
              </div>
            </div>
          ) : (
            <Card className="rh-doc-table-card">
              <CardHeader className="rh-doc-card-header">
                <CardTitle>{t("doc.title")}</CardTitle>
                <span className="rh-doc-table-muted">{t("doc.count", { n: filtered.length })}</span>
              </CardHeader>
              <div className="rh-doc-table-scroll">
                <table className="rh-doc-table">
                  <thead>
                    <tr>
                      <SortHeader
                        label={t("col.fileName")}
                        sortKey="name"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={requestSort}
                      />
                      <SortHeader
                        label={t("col.section")}
                        sortKey="sectionKey"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={requestSort}
                      />
                      <SortHeader
                        label={t("col.format")}
                        sortKey="type"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={requestSort}
                      />
                      <SortHeader
                        label={t("col.size")}
                        sortKey="sizeKb"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={requestSort}
                        align="right"
                      />
                      <SortHeader
                        label={t("col.date")}
                        sortKey="date"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={requestSort}
                      />
                      <th className="rh-doc-table-head rh-doc-table-head-action" />
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((d) => (
                      <tr key={d.id} className="rh-doc-file-row" onClick={() => setViewing(d)}>
                        <td className="rh-doc-table-cell">
                          <div className="rh-doc-table-name">
                            <FileText size={16} className="rh-doc-table-name-icon" /> {d.name}
                            {d.isNew && <Badge variant="green">{t("documents.badge.new")}</Badge>}
                          </div>
                        </td>
                        <td className="rh-doc-table-cell rh-doc-table-muted">{t(d.sectionKey)}</td>
                        <td className="rh-doc-table-cell">
                          <Badge variant={TYPE_BADGE[d.type] ?? "default"}>{d.type}</Badge>
                        </td>
                        <td className="rh-doc-table-cell rh-doc-table-muted rh-doc-table-num">
                          {formatSize(d.sizeKb)}
                        </td>
                        <td className="rh-doc-table-cell rh-doc-table-muted">{d.date}</td>
                        <td className="rh-doc-table-cell rh-doc-table-num">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewing(d);
                            }}
                          >
                            <Eye size={14} /> {t("action.view")}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {sorted.length === 0 && (
                      <tr>
                        <td colSpan={6}>
                          {folderDocs.length === 0 ? (
                            <div className="rh-doc-empty-state">
                              <div className="rh-doc-empty-icon-wrap">
                                <FileText size={24} className="rh-doc-empty-icon" />
                              </div>
                              <div className="rh-doc-empty-title">{t("folders.emptyTitle")}</div>
                              <div className="rh-doc-empty-desc">{t("folders.empty")}</div>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setUploadOpen(true)}
                              >
                                <UploadCloud size={14} /> {t("doc.upload")}
                              </Button>
                            </div>
                          ) : (
                            <div className="rh-doc-no-results">{t("filter.noResults")}</div>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      <Sheet open={!!viewing} onClose={() => setViewing(null)}>
        {viewing && (
          <>
            <DialogHeader
              title={viewing.name}
              description={`${t("docViewer.subtitle")} · ${t(viewing.sectionKey)}`}
              onClose={() => setViewing(null)}
            />
            <div className="rh-doc-viewer-body">
              <div className="rh-doc-viewer-page">
                <div className="rh-doc-viewer-meta">
                  <FileText size={16} /> {viewing.type} · {t(viewing.authorKey)} · {viewing.date}
                </div>
                <h2 className="rh-doc-viewer-title">{t("step2.docTitle")}</h2>
                {DOC_SENTENCES.map((s) => (
                  <p key={s.key} className="rh-doc-viewer-sentence">
                    {t(s.textKey)}
                  </p>
                ))}
                <p className="rh-doc-viewer-footnote">{t("docViewer.meta")}</p>
              </div>
            </div>
            <div className="rh-doc-viewer-footer">
              <Button
                variant="outline"
                onClick={() =>
                  downloadBlob(
                    viewing.name,
                    makeDummyContent(viewing.name, viewing.type),
                    "application/octet-stream",
                  )
                }
              >
                <Download size={16} /> {t("action.download")}
              </Button>
              <Button variant="secondary" onClick={() => setViewing(null)}>
                {t("action.close")}
              </Button>
            </div>
          </>
        )}
      </Sheet>

      <UploadDocumentModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={onUpload}
      />
      {project && onUpdateProject && setReports && (
        <BudgetCalculatorModal
          open={calcOpen}
          onClose={() => setCalcOpen(false)}
          project={project}
          documents={documents}
          onUpdateProject={onUpdateProject}
          setReports={setReports}
        />
      )}
    </div>
  );
}
