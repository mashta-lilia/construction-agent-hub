import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/providers/ToastProvider";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cx } from "@/lib/cx";
import { formatCurrency } from "@/lib/format";
import { Card } from "@/components/Card/Card";
import { Label } from "@/components/Label/Label";
import { Button } from "@/components/Button/Button";
import {
  Calculator,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  UploadCloud,
  X,
} from "@/components/Icon/icons";
import {
  BUDGET_MATERIAL_ROWS,
  BUDGET_SOURCE_DOC_TITLE_KEY,
  BUDGET_SOURCE_LINES,
} from "@/features/documents/constants/data";
import type { ProjectDocument } from "@/features/documents/types";
import type { Project } from "@/features/projects";
import type { Report } from "@/features/reports";
import "@/features/documents/documents.css";

/**
 * Ported from REHUB WORK V8.html, script block 6, lines ~2698-2904.
 *
 * Full-screen wizard (item 1 in the source's own commentary) rather than a
 * centered `Dialog` -- gives room for the pinned "Sources & Tracing" left
 * panel alongside the step-3 results table. Since this bypasses `Dialog`,
 * it wires `useFocusTrap` directly against its own root (same hook Dialog
 * and Sheet use), which both traps Tab focus and closes on Escape.
 */
interface NewBudgetFile {
  id: number;
  name: string;
  sizeKb: number;
}

export interface BudgetCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  documents: ProjectDocument[];
  onUpdateProject: (patch: Partial<Project>) => void;
  setReports: (updater: Report[] | ((prev: Report[]) => Report[])) => void;
}

/** Faithful port of the source's hardcoded "current date"/id-seed for the
 * report created on approval (script block 6, ~line 2750). */
const APPROVAL_DATE = "24.07.2026";

export function BudgetCalculatorModal({
  open,
  onClose,
  project,
  documents,
  onUpdateProject,
  setReports,
}: BudgetCalculatorModalProps) {
  const { t, locale } = useI18n();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<NewBudgetFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(0);
  /** Which `BUDGET_MATERIAL_ROWS` row (by index) is pinned in the left
   * "Sources & Tracing" panel -- stays open until Approve is clicked. */
  const [sourceRowIdx, setSourceRowIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedDocIds([]);
      setNewFiles([]);
      setDragOver(false);
      setLoadingIdx(0);
      setSourceRowIdx(null);
    }
  }, [open]);

  // Traps Tab focus within this full-screen overlay and closes on Escape --
  // same hook Dialog/Sheet use, so this overlay behaves identically to every
  // other modal in the app (CLAUDE.md requirement).
  useFocusTrap(open, rootRef, onClose);

  useEffect(() => {
    if (step !== 2) return;
    const iv = setInterval(() => setLoadingIdx((i) => (i + 1) % 3), 900);
    const to = setTimeout(() => setStep(3), 2800);
    return () => {
      clearInterval(iv);
      clearTimeout(to);
    };
  }, [step]);

  const toggleDoc = (id: number) =>
    setSelectedDocIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const addFiles = (fileList: FileList | null | undefined) => {
    const incoming = Array.from(fileList ?? []);
    if (!incoming.length) return;
    setNewFiles((prev) => [
      ...prev,
      ...incoming.map((f, i) => ({
        id: Date.now() + i,
        name: f.name,
        sizeKb: Math.max(1, Math.round(f.size / 1024)),
      })),
    ]);
  };

  const openPicker = () => inputRef.current?.click();
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const subtotal = useMemo(
    () => BUDGET_MATERIAL_ROWS.reduce((s, r) => s + r.unitPrice * r.qty, 0),
    [],
  );
  const buffer = subtotal * 0.15;
  const grandTotal = subtotal + buffer;
  const selectedCount = selectedDocIds.length + newFiles.length;
  const loadingMessages = [t("calc.loading1"), t("calc.loading2"), t("calc.loading3")];

  const handleApprove = () => {
    const prevBudget = project.budget;
    const prevUpdatedKey = project.updatedKey;
    const newReportId = Date.now();
    onUpdateProject({ budget: grandTotal, updatedKey: "budget.updatedJustNow" });
    setReports((prev) => [
      ...prev,
      {
        id: newReportId,
        nameKey: "budget.reportName",
        version: "v1.0",
        authorKey: "budget.reportAuthor",
        date: APPROVAL_DATE,
        format: "PDF",
        isNew: true,
        justNow: true,
      },
    ]);
    toast(t("toast.budgetApproved"), "success", () => {
      onUpdateProject({ budget: prevBudget, updatedKey: prevUpdatedKey });
      setReports((prev) => prev.filter((r) => r.id !== newReportId));
    });
    setSourceRowIdx(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      className="rh-doc-calc-overlay rh-animate-fade-in"
    >
      <div className="rh-doc-calc-topbar">
        <div className="rh-doc-calc-topbar-title">
          <div className="rh-doc-calc-topbar-icon">
            <Calculator size={16} className="rh-doc-calc-topbar-icon-svg" />
          </div>
          <div className="rh-doc-calc-topbar-text">
            <div className="rh-doc-calc-topbar-heading">{t("calc.title")}</div>
            <div className="rh-doc-calc-topbar-subheading">{t("calc.subtitle")}</div>
          </div>
        </div>
        <button onClick={onClose} aria-label={t("action.close")} className="rh-doc-calc-close">
          <X size={20} />
        </button>
      </div>

      <div className="rh-doc-calc-body">
        {step === 3 && sourceRowIdx != null && (
          <div className="rh-doc-calc-sources-panel rh-animate-slide-in">
            <div className="rh-doc-calc-sources-header">
              <div className="rh-doc-calc-sources-header-title">
                <FileText size={16} className="rh-doc-calc-sources-header-icon" />
                <span>{t("calc.sourcesTitle")}</span>
              </div>
              <button
                onClick={() => setSourceRowIdx(null)}
                aria-label={t("action.close")}
                className="rh-doc-calc-sources-close"
              >
                <X size={14} />
              </button>
            </div>
            <div className="rh-doc-calc-sources-content">
              <div className="rh-doc-calc-sources-doc">
                <h3 className="rh-doc-calc-sources-doc-title">{t(BUDGET_SOURCE_DOC_TITLE_KEY)}</h3>
                {BUDGET_SOURCE_LINES.map((lineKey, i) => (
                  <p
                    key={lineKey}
                    className={cx(
                      "rh-doc-calc-sources-line",
                      i === sourceRowIdx && "rh-doc-calc-sources-line-active",
                    )}
                  >
                    {t(lineKey)}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="rh-doc-calc-main">
          <div className="rh-doc-calc-main-inner">
            {step === 1 && (
              <>
                <div className="rh-doc-calc-step1">
                  <div>
                    <div className="rh-doc-calc-step-title">{t("calc.step1.title")}</div>
                    <p className="rh-doc-calc-step-subtitle">{t("calc.step1.subtitle")}</p>
                  </div>
                  <div>
                    <Label>{t("calc.existingDocs")}</Label>
                    <div className="rh-doc-calc-existing-list">
                      {documents.map((d) => (
                        <label key={d.id} className="rh-doc-calc-existing-item">
                          <input
                            type="checkbox"
                            checked={selectedDocIds.includes(d.id)}
                            onChange={() => toggleDoc(d.id)}
                            className="rh-doc-calc-existing-checkbox"
                          />
                          <FileText size={16} className="rh-doc-calc-existing-icon" />
                          <span className="rh-doc-calc-existing-name">{d.name}</span>
                        </label>
                      ))}
                      {documents.length === 0 && (
                        <div className="rh-doc-calc-existing-empty">{t("folders.empty")}</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>{t("calc.addFiles")}</Label>
                    <div
                      onClick={openPicker}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      className={cx(
                        "rh-doc-dropzone",
                        "rh-doc-calc-dropzone",
                        dragOver && "rh-doc-dropzone-active",
                      )}
                    >
                      <UploadCloud size={24} className="rh-doc-dropzone-icon" />
                      <div className="rh-doc-dropzone-text">{t("upload.dropHint")}</div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rh-doc-dropzone-browse"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPicker();
                        }}
                      >
                        <FileText size={14} /> {t("upload.browse")}
                      </Button>
                      <input
                        ref={inputRef}
                        type="file"
                        multiple
                        className="rh-doc-hidden-input"
                        onChange={(e) => {
                          addFiles(e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </div>
                    {newFiles.length > 0 && (
                      <div className="rh-doc-calc-newfiles rh-animate-fade-in">
                        {newFiles.map((f) => (
                          <div key={f.id} className="rh-doc-calc-newfile">
                            <CheckCircle2 size={14} className="rh-doc-calc-newfile-icon" />
                            <span className="rh-doc-calc-newfile-name">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="rh-doc-table-muted">
                    {t("calc.selectedCount", { n: selectedCount })}
                  </div>
                </div>
                <div className="rh-doc-calc-footer-actions">
                  <Button variant="outline" onClick={onClose}>
                    {t("calc.cancel")}
                  </Button>
                  <Button
                    variant="primary"
                    disabled={selectedCount === 0}
                    onClick={() => setStep(2)}
                  >
                    <Sparkles size={16} /> {t("calc.analyze")}
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="rh-doc-calc-loading">
                <Loader2 size={32} className="rh-doc-calc-loading-icon rh-animate-spin" />
                <div key={loadingIdx} className="rh-doc-calc-loading-text rh-animate-fade-in">
                  {loadingMessages[loadingIdx]}
                </div>
              </div>
            )}

            {step === 3 && (
              <>
                <div className="rh-doc-calc-step1">
                  <div>
                    <div className="rh-doc-calc-step-title">{t("calc.resultTitle")}</div>
                    <p className="rh-doc-calc-step-subtitle">{t("calc.resultSubtitle")}</p>
                  </div>
                  <Card className="rh-doc-table-card">
                    <div className="rh-doc-table-scroll">
                      <table className="rh-doc-table">
                        <thead>
                          <tr>
                            <th className="rh-doc-table-head">{t("col.material")}</th>
                            <th className="rh-doc-table-head">{t("col.supplier")}</th>
                            <th className="rh-doc-table-head rh-doc-table-head-num">
                              {t("col.unitPrice")}
                            </th>
                            <th className="rh-doc-table-head rh-doc-table-head-num">
                              {t("col.quantity")}
                            </th>
                            <th className="rh-doc-table-head rh-doc-table-head-num">
                              {t("col.total")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {BUDGET_MATERIAL_ROWS.map((r, i) => (
                            <tr
                              key={r.materialKey}
                              className={cx(sourceRowIdx === i && "rh-doc-calc-row-pinned")}
                            >
                              <td className="rh-doc-table-cell">
                                <button
                                  type="button"
                                  onClick={() => setSourceRowIdx((cur) => (cur === i ? null : i))}
                                  className="rh-doc-calc-row-link"
                                >
                                  {t(r.materialKey)}
                                </button>
                              </td>
                              <td className="rh-doc-table-cell rh-doc-table-muted">
                                {t(r.supplierKey)}
                              </td>
                              <td className="rh-doc-table-cell rh-doc-table-num">
                                <button
                                  type="button"
                                  onClick={() => setSourceRowIdx((cur) => (cur === i ? null : i))}
                                  className="rh-doc-calc-row-link"
                                >
                                  {formatCurrency(r.unitPrice, locale)}
                                </button>
                              </td>
                              <td className="rh-doc-table-cell rh-doc-table-num">
                                <button
                                  type="button"
                                  onClick={() => setSourceRowIdx((cur) => (cur === i ? null : i))}
                                  className="rh-doc-calc-row-link"
                                >
                                  {r.qty.toLocaleString()} {r.unit}
                                </button>
                              </td>
                              <td className="rh-doc-table-cell rh-doc-table-num rh-doc-calc-row-total">
                                {formatCurrency(r.unitPrice * r.qty, locale)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                  <div className="rh-doc-calc-totals">
                    <div className="rh-doc-calc-totals-row">
                      <span>{t("calc.subtotal")}</span>
                      <span className="rh-doc-calc-totals-value">
                        {formatCurrency(subtotal, locale)}
                      </span>
                    </div>
                    <div className="rh-doc-calc-totals-row">
                      <span>{t("calc.riskBuffer")}</span>
                      <span className="rh-doc-calc-totals-value">
                        {formatCurrency(buffer, locale)}
                      </span>
                    </div>
                    <div className="rh-doc-calc-totals-row rh-doc-calc-totals-grand">
                      <span>{t("calc.grandTotal")}</span>
                      <span>{formatCurrency(grandTotal, locale)}</span>
                    </div>
                  </div>
                </div>
                <div className="rh-doc-calc-footer-actions">
                  <Button variant="outline" onClick={onClose}>
                    {t("calc.cancel")}
                  </Button>
                  <Button variant="primary" onClick={handleApprove}>
                    <CheckCircle2 size={16} /> {t("calc.approve")}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
