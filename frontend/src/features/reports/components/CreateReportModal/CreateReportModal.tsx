import { useEffect, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { cx } from "@/lib/cx";
import { Dialog, DialogHeader } from "@/components/Dialog/Dialog";
import { Button } from "@/components/Button/Button";
import { Label } from "@/components/Label/Label";
import { Alert } from "@/components/Alert/Alert";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Download,
  FileText,
  Layers,
  Save,
  Sparkles,
} from "@/components/Icon/icons";
import type { Project } from "@/features/projects";
import { REPORT_TEMPLATES } from "@/features/reports/constants/data";
import type { CreateReportPayload, ReportTemplate } from "@/features/reports/types";
import { ReportPreview } from "@/features/reports/components/ReportPreview/ReportPreview";
import "@/features/reports/reports.css";

/**
 * Ported from REHUB WORK V8.html, script block 5, lines ~3344-3406
 * (`CreateReportModal`), plus its `TPL_ICONS` lookup (line ~3290).
 *
 * Escape-to-close and focus-trap are handled by `Dialog` itself
 * (`hooks/useFocusTrap.ts`) -- not re-implemented here.
 *
 * Deviation from source: the source's `handleSave` built the resulting
 * report's `name` inline as `{ en: title, uk: title }` (a bilingual object
 * with the SAME string in both languages, i.e. it never actually
 * translated the saved report's name). Here the saved report instead
 * carries `tpl.key` as its `nameKey` -- e.g. `"tpl.material"` -- which
 * resolves correctly in both locales via `t()`, and is also exactly what
 * `findTemplateForReport` (constants/data.ts) matches on to look the
 * template back up later (Report/ReportPreview view). This is a strict
 * improvement (the source's saved name never actually changed with
 * locale), not a functional deviation the caller needs to compensate for.
 */
const TPL_ICONS: Record<string, typeof Layers> = {
  material: Layers,
  monthly: BarChart3,
  defect: AlertTriangle,
};

export interface CreateReportModalProps {
  open: boolean;
  project: Project;
  onClose: () => void;
  onSave: (payload: CreateReportPayload) => void;
  /** Called with the report's resolved (translated) display name -- matches
   * source's `onDownload(title, format)` / `onDownload(L(r.name), r.format)`
   * (script block 5, ~lines 2985/3402), which always passed an already
   * human-readable name, never a raw key. */
  onDownload: (name: string, format: string) => void;
}

export function CreateReportModal({
  open,
  project,
  onClose,
  onSave,
  onDownload,
}: CreateReportModalProps) {
  const { t } = useI18n();
  const [templateValue, setTemplateValue] = useState<string | null>(null);
  const [format, setFormat] = useState("PDF");

  useEffect(() => {
    if (open) {
      setTemplateValue(null);
      setFormat("PDF");
    }
  }, [open]);

  const tpl: ReportTemplate | undefined = REPORT_TEMPLATES.find((tp) => tp.value === templateValue);
  const title = tpl ? t(tpl.key) : t("tpl.generic");
  const ext = format === "PDF" ? "pdf" : "xlsx";
  const fname = `${title.replace(/\s+/g, "_")}.${ext}`;

  const handleSave = () => {
    if (!tpl) return;
    onSave({ nameKey: tpl.key, format });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} size="lg">
      <DialogHeader
        title={t("createReport.title")}
        description={t("createReport.subtitle")}
        onClose={onClose}
      />
      <div className="rh-report-modal-body">
        <div>
          <Label>{t("report.chooseTemplate")}</Label>
          <div className="rh-report-tpl-grid">
            {REPORT_TEMPLATES.map((tp) => {
              const selected = templateValue === tp.value;
              const IconCmp = TPL_ICONS[tp.value] ?? FileText;
              return (
                <button
                  key={tp.value}
                  type="button"
                  onClick={() => setTemplateValue(tp.value)}
                  className={cx(
                    "rh-report-tpl-card",
                    selected
                      ? `rh-report-tpl-card-selected rh-report-tpl-card-${tp.accent}`
                      : "rh-report-tpl-card-idle",
                  )}
                >
                  <div className="rh-report-tpl-card-head">
                    <div
                      className={cx(
                        "rh-report-tpl-card-icon",
                        selected
                          ? `rh-report-tpl-icon-${tp.accent}`
                          : "rh-report-tpl-card-icon-idle",
                      )}
                    >
                      <IconCmp
                        size={16}
                        className={
                          selected
                            ? "rh-report-tpl-card-icon-svg-selected"
                            : "rh-report-tpl-card-icon-svg-idle"
                        }
                      />
                    </div>
                    {selected && <CheckCircle2 size={16} className="rh-report-tpl-card-check" />}
                  </div>
                  <div className="rh-report-tpl-card-title">{t(tp.key)}</div>
                  <div className="rh-report-tpl-card-desc">{t(tp.descKey)}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label>{t("createReport.format")}</Label>
          <div className="rh-report-format-toggle">
            {["PDF", "XLSX"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={cx(
                  "rh-report-format-btn",
                  format === f && "rh-report-format-btn-active",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {tpl ? (
          <div className="rh-report-modal-preview rh-animate-fade-in">
            <ReportPreview tpl={tpl} project={project} format={format} />
            <div className="rh-report-modal-willgenerate">
              <FileText size={16} />
              {t("createReport.willGenerate")}{" "}
              <span className="rh-report-modal-fname">{fname}</span>
            </div>
          </div>
        ) : (
          <div className="rh-report-modal-hint">{t("report.previewHint")}</div>
        )}

        <Alert variant="default" className="rh-report-modal-disclaimer">
          <Sparkles size={16} />
          <span>{t("createReport.disclaimer")}</span>
        </Alert>
      </div>
      <div className="rh-report-modal-footer">
        <Button variant="outline" disabled={!tpl} onClick={() => onDownload(title, format)}>
          <Download size={16} /> {t("createReport.download")}
        </Button>
        <Button variant="primary" disabled={!tpl} onClick={handleSave}>
          <Save size={16} /> {t("createReport.save")}
        </Button>
      </div>
    </Dialog>
  );
}
