import { useEffect, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/providers/ToastProvider";
import { cx } from "@/lib/cx";
import { Dialog, DialogHeader } from "@/components/Dialog/Dialog";
import { Button } from "@/components/Button/Button";
import { Label } from "@/components/Label/Label";
import { Input } from "@/components/Input/Input";
import { Select, type SelectOption } from "@/components/Select/Select";
import { MultiSelect } from "@/components/MultiSelect/MultiSelect";
import { AlertTriangle, Save, Send } from "@/components/Icon/icons";
import {
  ENGINEERS,
  STAGE_KEYS,
  checkEmailTaken,
  formatDeadlineFromMonth,
  getProjectEmail,
  normalizeCorporateEmail,
  parseDeadlineToMonthValue,
  type Project,
  type StageKey,
} from "@/features/projects";
import i18n from "@/i18n";
import "@/features/projects/projects.css";

/**
 * Ported from REHUB WORK V8.html, script block 8, ~lines 3914-3981
 * (`EditProjectModal`).
 *
 * Same `deadlineKey` "resolved text as passthrough key" deviation as
 * `NewProjectModal` -- see that component's doc comment.
 */
export interface EditProjectModalProps {
  open: boolean;
  project: Project;
  projects: Project[];
  onClose: () => void;
  onSave: (patch: Partial<Project>) => void;
}

export function EditProjectModal({
  open,
  project,
  projects,
  onClose,
  onSave,
}: EditProjectModalProps) {
  const { t, locale } = useI18n();
  const toast = useToast();
  const [stage, setStage] = useState<StageKey | "">("");
  const [deadlineMonth, setDeadlineMonth] = useState("");
  const [leadEngineer, setLeadEngineer] = useState("");
  const [team, setTeam] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    if (open) {
      setStage(project.statusKey || "planning");
      /* `parseDeadlineToMonthValue` expects the ENGLISH deadline text -- resolve via a
         locale-FORCED translator regardless of the current UI language, matching every
         other "must read the English form" rule in this feature (getProjectEmail, etc). */
      setDeadlineMonth(parseDeadlineToMonthValue(i18n.getFixedT("en")(project.deadlineKey)));
      setLeadEngineer(ENGINEERS.includes(project.leadEngineerKey) ? project.leadEngineerKey : "");
      setTeam(project.teamKeys.filter((k) => ENGINEERS.includes(k)));
      setEmail(getProjectEmail(project, i18n.getFixedT("en")(project.nameKey)));
      setEmailError("");
    }
  }, [open, project]);

  const engineerOptions: SelectOption[] = ENGINEERS.map((e) => ({ value: e, label: t(e) }));
  const stageOptions: SelectOption[] = STAGE_KEYS.map((k) => ({
    value: k,
    label: t(`status.${k}`),
  }));

  const handleForwardMail = () => toast(t("toast.forwardConfigured"));
  const handleEmailChange = (v: string) => {
    setEmail(v);
    if (emailError) setEmailError("");
  };
  const handleEmailBlur = () => setEmail((v) => normalizeCorporateEmail(v));

  const handleSave = () => {
    const normalized = normalizeCorporateEmail(email);
    if (checkEmailTaken(normalized, projects, project.id)) {
      setEmailError(t("email.taken"));
      return;
    }
    setEmail(normalized);
    const deadlineDisplay = deadlineMonth ? formatDeadlineFromMonth(deadlineMonth) : null;
    const deadlineKey = deadlineDisplay
      ? locale === "uk"
        ? deadlineDisplay.uk
        : deadlineDisplay.en
      : project.deadlineKey;
    onSave({
      statusKey: (stage || project.statusKey) as StageKey,
      deadlineKey,
      leadEngineerKey: leadEngineer || project.leadEngineerKey,
      teamKeys: team,
      corporateEmail: normalized,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} size="md">
      <DialogHeader title={t("edit.title")} description={t("edit.subtitle")} onClose={onClose} />
      <div className="rh-projform-body">
        <div>
          <Label>{t("edit.stage")}</Label>
          <Select value={stage} onChange={(v) => setStage(v as StageKey)} options={stageOptions} />
        </div>
        <div>
          <Label>{t("edit.deadline")}</Label>
          <Input
            type="month"
            value={deadlineMonth}
            onChange={(e) => setDeadlineMonth(e.target.value)}
          />
        </div>
        <div>
          <Label>{t("edit.leadEngineer")}</Label>
          <Select
            value={leadEngineer}
            onChange={setLeadEngineer}
            options={engineerOptions}
            placeholder={t("edit.leadEngineerPh")}
          />
        </div>
        <div>
          <Label>{t("newProject.team")}</Label>
          <MultiSelect
            values={team}
            onChange={setTeam}
            options={engineerOptions}
            placeholder={t("newProject.teamPh")}
          />
        </div>
        <div>
          <Label>{t("edit.corporateEmail")}</Label>
          <Input
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={handleEmailBlur}
            className={cx("rh-projform-input-mono", emailError && "rh-projform-input-error")}
          />
          {emailError && (
            <div className="rh-projform-field-error">
              <AlertTriangle size={12} /> {emailError}
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleForwardMail}>
          <Send size={14} /> {t("edit.forwardMail")}
        </Button>
      </div>
      <div className="rh-projform-footer">
        <Button variant="outline" onClick={onClose}>
          {t("edit.cancel")}
        </Button>
        <Button variant="primary" onClick={handleSave}>
          <Save size={16} /> {t("edit.save")}
        </Button>
      </div>
    </Dialog>
  );
}
