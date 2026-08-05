import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/providers/ToastProvider";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cx } from "@/lib/cx";
import { formatCurrency } from "@/lib/format";
import i18n from "@/i18n";
import { Dialog, DialogHeader } from "@/components/Dialog/Dialog";
import { Button } from "@/components/Button/Button";
import { Badge } from "@/components/Badge/Badge";
import { Alert } from "@/components/Alert/Alert";
import { Label } from "@/components/Label/Label";
import { Select, type SelectOption } from "@/components/Select/Select";
import { Input } from "@/components/Input/Input";
import { Textarea } from "@/components/Textarea/Textarea";
import {
  ArrowLeft,
  AlertTriangle,
  Check,
  ChevronRight,
  Copy,
  FileText,
  Link2,
  Loader2,
  PenLine,
  Send,
  Sparkles,
  X,
} from "@/components/Icon/icons";
import { CATEGORY_OPTIONS } from "@/features/documents";
import type { Project } from "@/features/projects";
import type { InboxMessage } from "@/features/inbox";
import { generateReply, generateReplyVariant, getScenario } from "@/features/norms/constants/data";
import type { AlertVariant } from "@/components/Alert/Alert";
import type { ScenarioSource, VerdictTone } from "@/features/norms/types";
import { resolveKeyedText } from "./utils";
import type { ConfirmKind, EditableField, SourceRef } from "./SubstitutionFlow.types";
import "@/features/norms/norms.css";

/**
 * Ported from REHUB WORK V8.html, script block 1, ~lines 3407-3743.
 *
 * Full-screen custom overlay (not `Dialog`) -- focus-trapped and closed on
 * Escape via `useFocusTrap`, same as every other overlay in the app, but
 * the trap's `onClose` is guarded on `confirmKind` so that when the
 * approve/reject confirm `Dialog` is open on top of this wizard, Escape
 * closes only that inner confirm dialog (its own `useFocusTrap` instance) --
 * it must NOT also skip straight to closing the whole wizard behind it.
 */
export interface SubstitutionFlowProps {
  open: boolean;
  project: Project;
  message: InboxMessage | null;
  onClose: () => void;
  onResolve: (
    kind: NonNullable<ConfirmKind>,
    genReply: boolean,
    autoSend: boolean,
    replyText: string,
  ) => void;
}

const VERDICT_ALERT_VARIANT: Record<VerdictTone, AlertVariant> = {
  critical: "red",
  amber: "amber",
  success: "green",
};

export function SubstitutionFlow({
  open,
  project,
  message,
  onClose,
  onResolve,
}: SubstitutionFlowProps) {
  const { t, locale } = useI18n();
  const toast = useToast();
  const panelRef = useRef<HTMLDivElement>(null);

  /* Scenario: resolved once per project, drives every scenario-specific piece
     of Step 1/2/3 content below. Compare-mode: when the originating `message`
     carries a `scenarioKey` (a project's 2nd simultaneous pending request),
     resolve THAT scenario instead of the project's primary one. */
  const scenarioKey = message?.scenarioKey;
  const scenario = useMemo(() => getScenario(project.id, scenarioKey), [project.id, scenarioKey]);

  const [step, setStep] = useState(1);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);

  /* Step 1 -- AI auto-detected category with optional manual override */
  const [category, setCategory] = useState(scenario.category);
  const [showOverride, setShowOverride] = useState(false);
  const [parsing, setParsing] = useState(false);

  /* Step 2 -- editable AI-extracted fields + multi-document source tracing */
  const [fields, setFields] = useState<EditableField[]>(() =>
    scenario.fields.map((f) => ({ ...f, val: resolveKeyedText(t, f.value, f.valueKey) })),
  );
  const [activeDoc, setActiveDoc] = useState(scenario.sources[0]?.key ?? "");
  const [focusSource, setFocusSource] = useState<SourceRef | null>(null);
  const [pinnedSource, setPinnedSource] = useState<SourceRef | null>(null);

  /* Step 3 -- reply draft, AI editor, auto-send */
  const [genReply, setGenReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [autoSend, setAutoSend] = useState(false);
  const [wandOpen, setWandOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const sentenceRefs = useRef<Record<string, HTMLParagraphElement | null>>({});

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setCategory(scenario.category);
    setShowOverride(false);
    setParsing(false);
    setFields(
      scenario.fields.map((f) => ({ ...f, val: resolveKeyedText(t, f.value, f.valueKey) })),
    );
    setActiveDoc(scenario.sources[0]?.key ?? "");
    setFocusSource(null);
    setPinnedSource(null);
    setGenReply(false);
    setReplyText(generateReply(i18n.getFixedT(locale), project, scenarioKey));
    setAutoSend(false);
    setWandOpen(false);
    setCustomPrompt("");
    setRegenerating(false);
    setConfirmKind(null);
    // Mirrors the source's own effect deps exactly: only re-runs when the
    // wizard opens or the resolved scenario changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scenario]);

  useEffect(() => {
    setReplyText(generateReply(i18n.getFixedT(locale), project, scenarioKey));
    setFields((prev) =>
      prev.map((f) => ({
        ...f,
        val: f.missing ? f.val : resolveKeyedText(t, f.value, f.valueKey),
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const closeWizard = useCallback(() => {
    if (!confirmKind) onClose();
  }, [confirmKind, onClose]);
  useFocusTrap(open, panelRef, closeWizard);

  if (!open) return null;

  const categoryOpts: SelectOption[] = CATEGORY_OPTIONS.map((o) => ({
    value: o.value,
    label: `${t(o.nodeLabelKey)} / ${t(o.materialLabelKey)}`,
  }));
  const currentCategoryOption =
    CATEGORY_OPTIONS.find((o) => o.value === category) ?? CATEGORY_OPTIONS[0];
  const categoryLabel = currentCategoryOption
    ? `${t(currentCategoryOption.nodeLabelKey)} / ${t(currentCategoryOption.materialLabelKey)}`
    : "";

  /* The sentence highlighted in the left-hand viewer: a pinned source wins
     over transient focus. Both are {doc,key} pairs so highlighting is aware
     of which of the 2-3 source documents is active. */
  const highlightedSource = pinnedSource ?? focusSource;
  const firstSource = scenario.sources[0];
  const activeSource: ScenarioSource | undefined =
    scenario.sources.find((s) => s.key === activeDoc) ?? firstSource;
  const verdictVariant = VERDICT_ALERT_VARIANT[scenario.verdict.tone];

  const handleParse = () => {
    setParsing(true);
    setTimeout(() => {
      setParsing(false);
      setStep(2);
    }, 1500);
  };
  const setVal = (key: string, v: string) =>
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, val: v } : f)));

  /* Clicking a source link switches the active document tab AND
     highlights/pins the matching sentence within it. */
  const pinSource = (docKey: string | null, key: string | null) => {
    if (!docKey || !key) return;
    setActiveDoc(docKey);
    setPinnedSource((prev) =>
      prev && prev.doc === docKey && prev.key === key ? null : { doc: docKey, key },
    );
    setTimeout(() => {
      const node = sentenceRefs.current[`${docKey}:${key}`];
      node?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 0);
  };
  const focusFieldSource = (f: EditableField) => {
    if (f.sourceDoc && f.sourceKey) {
      setActiveDoc(f.sourceDoc);
      setFocusSource({ doc: f.sourceDoc, key: f.sourceKey });
    }
  };
  const copyReply = () => {
    try {
      if (navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(replyText);
      } else {
        const ta = document.createElement("textarea");
        ta.value = replyText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
    } catch {
      /* clipboard unavailable in this context -- the toast still confirms the action */
    }
    toast(t("toast.copied"));
  };
  const regenerate = (tone: "polite" | "formal" | "custom") => {
    setRegenerating(true);
    setTimeout(() => {
      setReplyText(
        generateReplyVariant(i18n.getFixedT(locale), project, tone, customPrompt, scenarioKey),
      );
      setRegenerating(false);
      setWandOpen(false);
      setCustomPrompt("");
      toast(t("toast.regenerated"));
    }, 900);
  };

  const stepDots = [1, 2, 3];

  return (
    <div ref={panelRef} className="rh-subflow-overlay rh-animate-fade-in">
      <div className="rh-subflow-header">
        <div className="d-flex align-items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={t("action.close")}
            title={t("action.close")}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <div className="rh-subflow-header-title">{t("wiz.title")}</div>
            <div className="rh-subflow-header-subtitle">
              {t("wiz.requestFrom", {
                c: message ? t(message.companyKey) : t(scenario.email.companyKey),
                p: t(project.nameKey),
              })}
            </div>
          </div>
        </div>
        <div className="rh-subflow-steps">
          {stepDots.map((s) => (
            <div key={s} className="d-flex align-items-center gap-2">
              <div className={cx("rh-subflow-step-dot", step >= s && "rh-subflow-step-dot-active")}>
                {step > s ? <Check size={14} /> : s}
              </div>
              {s < 3 && (
                <div
                  className={cx("rh-subflow-step-line", step > s && "rh-subflow-step-line-active")}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rh-subflow-body">
        {step === 1 && (
          <div className="rh-subflow-step1">
            <div className="rh-subflow-step1-inner">
              <h2 className="rh-subflow-step-title">{t("step1.title")}</h2>
              <p className="rh-subflow-step-subtitle">{t("step1.subtitle")}</p>

              <div className="rh-subflow-detect-card">
                <div className="rh-subflow-detect-icon">
                  <Sparkles size={20} color="#fff" />
                </div>
                <div className="rh-subflow-detect-body">
                  <div className="rh-subflow-detect-label">{t("step1.aiDetected")}</div>
                  <div className="rh-subflow-detect-value">{categoryLabel}</div>
                  <div className="rh-subflow-detect-hint">
                    {firstSource ? t("funnel.sourceFound", { f: firstSource.name }) : ""}
                  </div>
                </div>
                <Badge variant="blue" className="rh-subflow-detect-badge">
                  <Check size={12} /> {t("step1.confidence")}
                </Badge>
              </div>

              {!showOverride ? (
                <div className="mt-3">
                  <Button variant="ghost" size="sm" onClick={() => setShowOverride(true)}>
                    <PenLine size={14} /> {t("step1.changeCategory")}
                  </Button>
                </div>
              ) : (
                <div className="mt-4 rh-animate-fade-in">
                  <Label>{t("step1.categoryLabel")}</Label>
                  <Select value={category} onChange={setCategory} options={categoryOpts} />
                </div>
              )}

              <div className="mt-4">
                <Button variant="primary" disabled={parsing} onClick={handleParse}>
                  {parsing ? (
                    <>
                      <Loader2 size={16} className="rh-animate-spin" /> {t("funnel.parsing")}
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> {t("funnel.parse")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="rh-subflow-step2">
            <div className="rh-subflow-step2-left">
              <div className="rh-subflow-doctabs-head">
                <div className="rh-subflow-doctabs-label">{t("step2.sourceDocs")}</div>
                <div className="rh-subflow-doctabs">
                  {scenario.sources.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setActiveDoc(s.key)}
                      className={cx(
                        "rh-subflow-doctab",
                        activeDoc === s.key && "rh-subflow-doctab-active",
                      )}
                    >
                      <FileText size={14} /> {s.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rh-subflow-docviewer">
                {activeSource && (
                  <div className="rh-subflow-docviewer-card">
                    <h3 className="rh-subflow-doc-title">{t(activeSource.titleKey)}</h3>
                    {activeSource.sentences.map((s) => (
                      <p
                        key={s.key}
                        ref={(el) => {
                          sentenceRefs.current[`${activeDoc}:${s.key}`] = el;
                        }}
                        className={cx(
                          "rh-subflow-doc-sentence",
                          highlightedSource &&
                            highlightedSource.doc === activeDoc &&
                            highlightedSource.key === s.key &&
                            "rh-subflow-doc-sentence-highlight",
                        )}
                      >
                        {t(s.textKey)}
                      </p>
                    ))}
                    <p className="rh-subflow-doc-hint">{t("step2.focusHint")}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="rh-subflow-step2-right">
              <div className="rh-subflow-aidata-head">
                <Sparkles size={16} className="rh-subflow-aidata-icon" />
                <span>{t("step2.aiData")}</span>
              </div>
              <div className="rh-subflow-aidata-body">
                <Alert variant="default" className="rh-subflow-autofill-alert">
                  <Sparkles size={16} className="rh-subflow-autofill-icon" />
                  <span>{t("step2.autofill")}</span>
                </Alert>
                <div className="rh-subflow-fields">
                  {fields.map((f) => {
                    const isPinned =
                      !!f.sourceDoc &&
                      !!pinnedSource &&
                      pinnedSource.doc === f.sourceDoc &&
                      pinnedSource.key === f.sourceKey;
                    return (
                      <div key={f.key} className="rh-subflow-field">
                        <div className="rh-subflow-field-head">
                          <label className="rh-subflow-field-label">{t(f.labelKey)}</label>
                          {f.sourceDoc ? (
                            <button
                              type="button"
                              onClick={() => pinSource(f.sourceDoc, f.sourceKey)}
                              title={t("step2.sourceLink")}
                              className={cx(
                                "rh-subflow-source-link",
                                isPinned && "rh-subflow-source-link-pinned",
                              )}
                            >
                              <Link2 size={12} /> {t("step2.sourceLink")}
                            </button>
                          ) : (
                            <span className="rh-subflow-source-link-none">
                              <Link2 size={12} /> —
                            </span>
                          )}
                        </div>
                        <Input
                          value={f.val}
                          onChange={(e) => setVal(f.key, e.target.value)}
                          onFocus={() => focusFieldSource(f)}
                          onBlur={() => setFocusSource(null)}
                          placeholder={f.missing ? t("field.missing") : ""}
                          className={f.missing && f.val === "" ? "rh-subflow-field-missing" : ""}
                        />
                        {f.missing && f.val === "" && (
                          <div className="rh-subflow-field-warning">
                            <AlertTriangle size={12} /> {t("field.missing")}
                          </div>
                        )}
                        {isPinned && (
                          <div className="rh-subflow-field-pinned-hint rh-animate-fade-in">
                            <Link2 size={12} /> {t("step2.sourcePinned")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div>
                  <div className="rh-subflow-table-title">{t("table1.title")}</div>
                  <div className="rh-subflow-table-wrap">
                    <table className="rh-subflow-table">
                      <thead>
                        <tr>
                          <th>{t("table1.criterion")}</th>
                          <th>{t("table1.spec")}</th>
                          <th>{t("table1.limit")}</th>
                          <th>{t("table1.proposal")}</th>
                          <th>{t("table1.status")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scenario.table1.map((row, i) => (
                          <tr
                            key={i}
                            className={
                              row.status === "violation" ? "rh-subflow-table-row-violation" : ""
                            }
                          >
                            <td className="rh-subflow-table-crit">
                              {t(row.critKey)}
                              {row.sourceDoc && (
                                <button
                                  type="button"
                                  onClick={() => pinSource(row.sourceDoc, row.sourceKey)}
                                  title={t("step2.sourceLink")}
                                  className="rh-subflow-table-source-btn"
                                >
                                  <Link2 size={12} />
                                </button>
                              )}
                            </td>
                            <td>{t(row.specKey)}</td>
                            <td>{t(row.limitKey)}</td>
                            <td className="rh-subflow-table-proposal">{t(row.proposalKey)}</td>
                            <td>
                              <Badge variant={row.status === "violation" ? "red" : "green"}>
                                {row.status === "violation" && <AlertTriangle size={12} />}
                                {t(
                                  row.status === "violation"
                                    ? "table1.violation"
                                    : "table1.compliant",
                                )}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <div className="rh-subflow-table-title">{t("table2.title")}</div>
                  <div className="rh-subflow-table-wrap">
                    <table className="rh-subflow-table">
                      <thead>
                        <tr>
                          <th>{t("table2.criterion")}</th>
                          <th>{t("table2.actual")}</th>
                          <th>{t("table2.proposed")}</th>
                          <th>{t("table2.impact")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scenario.table2.map((row, i) => (
                          <tr key={i}>
                            <td>{t(row.critKey)}</td>
                            <td className="rh-subflow-table-proposal">
                              {resolveKeyedText(t, row.actual, row.actualKey)}
                            </td>
                            <td className="rh-subflow-table-proposal">
                              {resolveKeyedText(t, row.proposed, row.proposedKey)}
                            </td>
                            <td className="rh-subflow-table-impact">{t(row.impactKey)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rh-subflow-cost-bar">
                  <span>{t("compare.costImpact")}</span>
                  <span className="rh-subflow-cost-value">
                    −{formatCurrency(Math.abs(scenario.costDelta), locale)}
                  </span>
                </div>
                <Alert variant={verdictVariant}>
                  <AlertTriangle size={16} />
                  <div>
                    <div className="rh-subflow-verdict-title">{t(scenario.verdict.titleKey)}</div>
                    <div className="rh-subflow-verdict-desc">{t(scenario.verdict.descKey)}</div>
                  </div>
                </Alert>
              </div>
              <div className="rh-subflow-step2-footer">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> {t("wiz.back")}
                </Button>
                <Button variant="primary" onClick={() => setStep(3)}>
                  {t("wiz.next")} <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rh-subflow-step3">
            <div className="rh-subflow-step3-inner">
              <h2 className="rh-subflow-step-title">{t("step3.title")}</h2>
              <p className="rh-subflow-step-subtitle">{t("step3.subtitle")}</p>
              <Alert variant={verdictVariant} className="mb-4">
                <AlertTriangle size={16} />
                <div>
                  <div className="rh-subflow-verdict-title">{t(scenario.verdict.titleKey)}</div>
                  <div className="rh-subflow-verdict-desc">{t(scenario.verdict.descKey)}</div>
                </div>
              </Alert>

              <label className="rh-subflow-checkbox-row">
                <input
                  type="checkbox"
                  checked={genReply}
                  onChange={(e) => setGenReply(e.target.checked)}
                  className="rh-subflow-checkbox"
                />
                <span className="rh-subflow-checkbox-label">{t("step3.genReply")}</span>
              </label>
              <label
                className={cx(
                  "rh-subflow-checkbox-row",
                  !genReply && "rh-subflow-checkbox-row-disabled",
                )}
              >
                <input
                  type="checkbox"
                  disabled={!genReply}
                  checked={autoSend}
                  onChange={(e) => setAutoSend(e.target.checked)}
                  className="rh-subflow-checkbox"
                />
                <span className="rh-subflow-checkbox-label">
                  <Send size={14} className="rh-subflow-checkbox-icon" /> {t("step3.autoSend")}
                </span>
              </label>

              {genReply && (
                <div className="rh-subflow-reply rh-animate-fade-in">
                  <Label>{t("step3.replyLabel")}</Label>
                  <div className="rh-subflow-editor-toolbar">
                    <button
                      type="button"
                      onClick={copyReply}
                      title={t("editor.copy")}
                      className="rh-subflow-editor-btn"
                    >
                      <Copy size={16} />
                    </button>
                    <div className="rh-subflow-editor-divider" />
                    <button
                      type="button"
                      onClick={() => setWandOpen((o) => !o)}
                      title={t("editor.regenerate")}
                      className={cx(
                        "rh-subflow-editor-btn",
                        wandOpen && "rh-subflow-editor-btn-active",
                      )}
                    >
                      <Sparkles size={16} />
                    </button>
                  </div>

                  {wandOpen && (
                    <div className="rh-subflow-wand-popover rh-animate-fade-in">
                      <div className="rh-subflow-wand-title">
                        <Sparkles size={14} /> {t("editor.aiTools")}
                      </div>
                      <div className="rh-subflow-wand-actions">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={regenerating}
                          onClick={() => regenerate("polite")}
                        >
                          {t("editor.morePolite")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={regenerating}
                          onClick={() => regenerate("formal")}
                        >
                          {t("editor.moreFormal")}
                        </Button>
                      </div>
                      <div className="rh-subflow-wand-prompt">
                        <Input
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder={t("editor.customPrompt")}
                          className="flex-1"
                        />
                        <Button
                          variant="primary"
                          disabled={regenerating}
                          onClick={() => regenerate(customPrompt.trim() ? "custom" : "polite")}
                        >
                          {regenerating ? (
                            <>
                              <Loader2 size={16} className="rh-animate-spin" />{" "}
                              {t("editor.regenerating")}
                            </>
                          ) : (
                            <>
                              <Sparkles size={16} /> {t("editor.regenBtn")}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="rh-subflow-textarea-wrap">
                    <Textarea
                      rows={11}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className={regenerating ? "rh-subflow-textarea-regenerating" : ""}
                    />
                    {regenerating && (
                      <div className="rh-subflow-textarea-overlay">
                        <div className="rh-subflow-textarea-overlay-badge">
                          <Loader2 size={16} className="rh-animate-spin" />{" "}
                          {t("editor.regenerating")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="rh-subflow-step3-actions">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft size={16} /> {t("step3.back")}
                </Button>
                <div className="d-flex gap-2">
                  <Button variant="destructive" onClick={() => setConfirmKind("rejected")}>
                    <X size={16} /> {t("step3.rejectBtn")}
                  </Button>
                  <Button variant="primary" onClick={() => setConfirmKind("approved")}>
                    <Check size={16} /> {t("step3.approveBtn")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="rh-subflow-disclaimer">{t("disclaimer")}</div>

      {/* The confirmation dialog's copy/styling/confirm-label branch on BOTH
          which button was clicked (confirmKind) AND the scenario's verdict
          tone -- a "success" verdict is the only positive case;
          "critical"/"amber" are both negative. */}
      <Dialog open={!!confirmKind} onClose={() => setConfirmKind(null)} size="sm">
        {confirmKind &&
          (() => {
            const positive = scenario.verdict.tone === "success";
            const isReject = confirmKind === "rejected";
            const descKey = isReject
              ? positive
                ? "confirm.reject.desc.positive"
                : "confirm.reject.desc.negative"
              : positive
                ? "confirm.approve.desc.positive"
                : "confirm.approve.desc.negative";
            /* Red/warning styling when the chosen action goes AGAINST the
               agent's recommendation (rejecting a recommended change, or
               approving a not-recommended one); green/neutral styling when
               the chosen action AGREES with the recommendation. */
            const goesAgainstRecommendation = isReject ? positive : !positive;
            const dialogVariant: AlertVariant = goesAgainstRecommendation ? "red" : "green";
            const confirmVariant = goesAgainstRecommendation ? "destructive" : "primary";
            const confirmLabelKey = isReject
              ? positive
                ? "confirm.rejectAnyway"
                : "confirm.rejectSubstitution"
              : positive
                ? "confirm.approveSubstitution"
                : "confirm.approveAnyway";
            const titleKey = isReject ? "confirm.rejectTitle" : "confirm.approveTitle";
            return (
              <>
                <DialogHeader title={t(titleKey)} onClose={() => setConfirmKind(null)} />
                <div className="rh-subflow-confirm-body">
                  <Alert variant={dialogVariant}>
                    <AlertTriangle size={16} />
                    <span>{t(descKey)}</span>
                  </Alert>
                </div>
                <div className="rh-subflow-confirm-footer">
                  <Button variant="outline" onClick={() => setConfirmKind(null)}>
                    {t("confirm.cancel")}
                  </Button>
                  <Button
                    variant={confirmVariant}
                    onClick={() => {
                      const kind = confirmKind;
                      setConfirmKind(null);
                      onResolve(kind, genReply, autoSend, replyText);
                    }}
                  >
                    {t(confirmLabelKey)}
                  </Button>
                </div>
              </>
            );
          })()}
      </Dialog>
    </div>
  );
}
