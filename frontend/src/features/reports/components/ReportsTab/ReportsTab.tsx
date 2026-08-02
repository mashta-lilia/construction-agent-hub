import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useSortableData } from "@/hooks/useSortableData";
import { Card } from "@/components/Card/Card";
import { Button } from "@/components/Button/Button";
import { Badge } from "@/components/Badge/Badge";
import { Dialog, DialogHeader } from "@/components/Dialog/Dialog";
import { SortHeader } from "@/components/SortHeader/SortHeader";
import { BarChart3, Download, Eye, Plus } from "@/components/Icon/icons";
import type { Project } from "@/features/projects";
import { findTemplateForReport } from "@/features/reports/constants/data";
import type { CreateReportPayload, Report } from "@/features/reports/types";
import { CreateReportModal } from "@/features/reports/components/CreateReportModal/CreateReportModal";
import { ReportPreview } from "@/features/reports/components/ReportPreview/ReportPreview";
import "@/features/reports/reports.css";

/**
 * Ported from REHUB WORK V8.html, script block 5, lines ~2935-3001
 * (`ReportsTab`).
 *
 * `useSortableData` sorts on the RAW row (comparing `nameKey`/`authorKey`
 * strings, not their translated display text) since the hook is generic
 * and locale-independent -- same limitation the source had sorting on
 * `.en` of its bilingual `name`/`author` objects rather than the
 * currently-displayed locale.
 */
export interface ReportsTabProps {
  project: Project;
  reports: Report[];
  onCreate: (payload: CreateReportPayload) => void;
  onDownload: (name: string, format: string) => void;
}

export function ReportsTab({ project, reports, onCreate, onDownload }: ReportsTabProps) {
  const { t } = useI18n();
  /* `useSortableData<T extends Record<string, unknown>>` needs an explicit
   * index-signature-compatible type argument under project-mode `tsc -b`
   * (plain interfaces like `Report` aren't structurally assignable to
   * `Record<string, unknown>` without one) -- this local cast satisfies the
   * hook's generic constraint without changing the shared `Report` type or
   * the hook itself, both out of this feature's scope. Same pre-existing
   * constraint mismatch is independently hit by `features/documents`. */
  const { sorted, sortKey, sortDir, requestSort } = useSortableData(
    reports as (Report & Record<string, unknown>)[],
    "date",
    "desc",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);

  return (
    <div>
      <div className="rh-report-toolbar">
        <div className="rh-report-count">{t("reports.count", { n: reports.length })}</div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> {t("reports.create")}
        </Button>
      </div>
      <Card className="rh-report-table-card">
        {sorted.length === 0 ? (
          <div className="rh-report-empty">
            <div className="rh-report-empty-icon">
              <BarChart3 size={24} />
            </div>
            <div className="rh-report-empty-title">{t("reports.emptyTitle")}</div>
            <div className="rh-report-empty-desc">{t("reports.emptyDesc")}</div>
            <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
              <Plus size={14} /> {t("reports.create")}
            </Button>
          </div>
        ) : (
          <table className="rh-report-table">
            <thead>
              <tr>
                <SortHeader
                  label={t("col.name")}
                  sortKey="nameKey"
                  activeKey={sortKey as string | null}
                  dir={sortDir}
                  onSort={(k) => requestSort(k as keyof Report)}
                />
                <SortHeader
                  label={t("col.version")}
                  sortKey="version"
                  activeKey={sortKey as string | null}
                  dir={sortDir}
                  onSort={(k) => requestSort(k as keyof Report)}
                />
                <SortHeader
                  label={t("col.committer")}
                  sortKey="authorKey"
                  activeKey={sortKey as string | null}
                  dir={sortDir}
                  onSort={(k) => requestSort(k as keyof Report)}
                />
                <SortHeader
                  label={t("col.date")}
                  sortKey="date"
                  activeKey={sortKey as string | null}
                  dir={sortDir}
                  onSort={(k) => requestSort(k as keyof Report)}
                />
                <SortHeader
                  label={t("col.format")}
                  sortKey="format"
                  activeKey={sortKey as string | null}
                  dir={sortDir}
                  onSort={(k) => requestSort(k as keyof Report)}
                />
                <th className="rh-report-table-actions-head" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id} className="rh-report-table-row">
                  <td className="rh-report-table-name">
                    <div className="rh-report-table-name-inner">
                      <BarChart3 size={16} className="rh-report-table-name-icon" />
                      {t(r.nameKey)}
                      {r.isNew && <Badge variant="green">{t("reports.newBadge")}</Badge>}
                    </div>
                  </td>
                  <td className="rh-report-table-version">{r.version}</td>
                  <td className="rh-report-table-author">{t(r.authorKey)}</td>
                  <td className="rh-report-table-date">
                    {r.justNow ? t("reports.justNow") : r.date}
                  </td>
                  <td>
                    <Badge variant={r.format === "PDF" ? "red" : "green"}>{r.format}</Badge>
                  </td>
                  <td className="rh-report-table-actions">
                    <button
                      type="button"
                      onClick={() => setViewingReport(r)}
                      title={t("action.view")}
                      aria-label={t("action.view")}
                      className="rh-report-action-btn"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownload(t(r.nameKey), r.format)}
                      title={t("action.download")}
                      aria-label={t("action.download")}
                      className="rh-report-action-btn"
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <CreateReportModal
        open={modalOpen}
        project={project}
        onClose={() => setModalOpen(false)}
        onSave={onCreate}
        onDownload={onDownload}
      />

      <Dialog open={!!viewingReport} onClose={() => setViewingReport(null)} size="lg">
        {viewingReport && (
          <>
            <DialogHeader
              title={t(viewingReport.nameKey)}
              description={viewingReport.version}
              onClose={() => setViewingReport(null)}
            />
            <div className="rh-report-view-body">
              <ReportPreview
                tpl={findTemplateForReport(viewingReport)}
                project={project}
                format={viewingReport.format}
              />
            </div>
            <div className="rh-report-view-footer">
              <Button
                variant="outline"
                onClick={() => onDownload(t(viewingReport.nameKey), viewingReport.format)}
              >
                <Download size={16} /> {t("action.download")}
              </Button>
              <Button variant="secondary" onClick={() => setViewingReport(null)}>
                {t("action.close")}
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
}
