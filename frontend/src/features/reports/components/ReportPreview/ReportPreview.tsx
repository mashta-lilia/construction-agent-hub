import { useI18n } from "@/hooks/useI18n";
import { cx } from "@/lib/cx";
import { formatBudget } from "@/lib/format";
import { Badge } from "@/components/Badge/Badge";
import { Eye } from "@/components/Icon/icons";
import type { Project } from "@/features/projects";
import type { AnyReportTemplate } from "@/features/reports/types";

/**
 * Ported from REHUB WORK V8.html, script block 5, lines ~3293-3343
 * (`ReportPreview`), plus its `TPL_ACCENTS` lookup (lines ~3285-3289).
 *
 * `Project` fields are i18n KEYS in this port (`nameKey`, `clientKey`,
 * `deadlineKey`, `leadEngineerKey`), not the source's bilingual `{en,uk}`
 * objects -- rendered via `t()` instead of `L()`. `TPL_ACCENTS`' Tailwind
 * utility classes (`border-blue-500 bg-blue-50/50`, etc.) were translated
 * to the `rh-report-tpl-*` classes in `../../reports.css`, which is the
 * one shared stylesheet for this whole feature per CLAUDE-WORKFLOW.md
 * §2.1 (no per-component CSS files inside a feature).
 */
export interface ReportPreviewProps {
  tpl: AnyReportTemplate;
  project: Project;
  format: string;
}

export function ReportPreview({ tpl, project, format }: ReportPreviewProps) {
  const { t } = useI18n();

  const rows = [
    { label: t("preview.client"), value: t(project.clientKey) },
    { label: t("preview.budget"), value: formatBudget(project.budget, t) },
    { label: t("edit.stage"), value: t("status." + project.statusKey) },
    { label: t("preview.deadline"), value: t(project.deadlineKey) },
  ];

  return (
    <div className="rh-report-preview">
      <div className="rh-report-preview-label">
        <Eye size={14} /> {t("report.preview")}
      </div>
      <div className="rh-report-preview-card">
        <div className={cx("rh-report-preview-bar", `rh-report-tpl-bar-${tpl.accent}`)} />
        <div className="rh-report-preview-body">
          <div className="rh-report-preview-head">
            <div className="rh-report-preview-head-main">
              <div className="rh-report-preview-eyebrow">{t("preview.reportFor")}</div>
              <div className="rh-report-preview-name">{t(project.nameKey)}</div>
              <div className="rh-report-preview-id">{project.id}</div>
            </div>
            <Badge
              variant={format === "PDF" ? "red" : "green"}
              className="rh-report-preview-format"
            >
              {format}
            </Badge>
          </div>
          <div className="rh-report-preview-tpl-name">{t(tpl.key)}</div>
          <div className="rh-report-preview-rows">
            {rows.map((r) => (
              <div key={r.label} className="rh-report-preview-row">
                <div className="rh-report-preview-row-label">{r.label}</div>
                <div className="rh-report-preview-row-value" title={r.value}>
                  {r.value}
                </div>
              </div>
            ))}
          </div>
          <div className="rh-report-preview-sections">
            <div className="rh-report-preview-sections-label">{t("preview.contents")}</div>
            <div className="rh-report-preview-sections-list">
              {tpl.sectionsKeys.map((sectionKey, i) => (
                <div key={sectionKey} className="rh-report-preview-section-row">
                  <span
                    className={cx(
                      "rh-report-preview-section-num",
                      `rh-report-tpl-tint-${tpl.accent}`,
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="rh-report-preview-section-label">{t(sectionKey)}</span>
                  <span className="rh-report-preview-section-line" />
                </div>
              ))}
            </div>
          </div>
          <div className="rh-report-preview-footer">
            {t("preview.generatedBy")}: {t(project.leadEngineerKey)} · 24.07.2026
          </div>
        </div>
      </div>
    </div>
  );
}
