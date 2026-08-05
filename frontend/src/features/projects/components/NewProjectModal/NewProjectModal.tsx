import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { cx } from "@/lib/cx";
import { formatSize } from "@/lib/format";
import { Dialog, DialogHeader } from "@/components/Dialog/Dialog";
import { Button } from "@/components/Button/Button";
import { Label } from "@/components/Label/Label";
import { Input } from "@/components/Input/Input";
import { Select, type SelectOption } from "@/components/Select/Select";
import { MultiSelect } from "@/components/MultiSelect/MultiSelect";
import { AlertTriangle, FileText, Plus, Sparkles, UploadCloud, X } from "@/components/Icon/icons";
import { DOC_CATEGORY_OPTIONS, guessDocCategory } from "@/features/documents";
import {
  ENGINEERS,
  checkEmailTaken,
  formatDeadlineFromMonth,
  projectEmailAddress,
  normalizeCorporateEmail,
  type Project,
} from "@/features/projects";
import "@/features/projects/projects.css";

/**
 * Ported from REHUB WORK V8.html, script block 6, ~lines 2323-2469
 * (`NewProjectModal`).
 *
 * Item 7: the corporate email field auto-suggests from the project name
 * UNTIL the user manually edits it directly (tracked via `emailEdited`).
 *
 * Field-shape deviation from source: `deadlineKey`/`locationKey` below are
 * NOT real i18n dictionary keys -- they hold the already-resolved display
 * text (current locale's month/year label, or the trimmed free-typed
 * location). `Project.deadlineKey`/`locationKey` are typed as plain i18n
 * keys everywhere else (resolved to seed data via `t()`), but a project
 * created at runtime has no compile-time dictionary entry to point at.
 * Storing the resolved text directly works because react-i18next's
 * `t()` returns an unmatched key verbatim (its default missing-key
 * behavior) -- so `t(deadlineKey)` renders that exact text in every
 * locale. This is a deliberate, flagged simplification: a user-set
 * deadline/location won't re-translate if the UI language is switched
 * later, same limitation `nameKey` already has for a manually-typed
 * project name. `leadEngineerKey`/`teamKeys` do NOT have this problem --
 * they're picked from `ENGINEERS`, which already holds real i18n keys.
 */
export interface NewProjectFilePayload {
  id: number;
  name: string;
  sizeKb: number;
  category: string;
}

export interface NewProjectPayload {
  nameKey: string;
  leadEngineerKey: string;
  teamKeys: string[];
  deadlineKey: string;
  locationKey: string;
  corporateEmail: string;
  files: NewProjectFilePayload[];
}

export interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: NewProjectPayload) => void;
  projects: Project[];
}

export function NewProjectModal({ open, onClose, onCreate, projects }: NewProjectModalProps) {
  const { t, locale } = useI18n();
  const [name, setName] = useState("");
  const [leadEngineer, setLeadEngineer] = useState("");
  const [team, setTeam] = useState<string[]>([]);
  const [deadlineMonth, setDeadlineMonth] = useState("");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState<NewProjectFilePayload[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; leadEngineer?: string }>({});
  const inputRef = useRef<HTMLInputElement>(null);
  // A plain counter, not `Date.now() + i`: two `addFiles` calls within the
  // same millisecond (e.g. a second drag-drop right after the first) would
  // otherwise claim overlapping ids, and `removeFile`/`setFileCategory`
  // both key by this id.
  const nextFileId = useRef(0);
  const [email, setEmail] = useState("");
  const [emailEdited, setEmailEdited] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setLeadEngineer("");
      setTeam([]);
      setDeadlineMonth("");
      setLocation("");
      setFiles([]);
      setDragOver(false);
      setErrors({});
      setEmail("");
      setEmailEdited(false);
      setEmailError("");
    }
  }, [open]);
  useEffect(() => {
    if (!emailEdited) setEmail(name.trim() ? projectEmailAddress(name) : "");
  }, [name, emailEdited]);

  const addFiles = (fileList: FileList | null | undefined) => {
    const incoming = Array.from(fileList ?? []);
    if (!incoming.length) return;
    setFiles((prev) => [
      ...prev,
      ...incoming.map((f) => ({
        id: nextFileId.current++,
        name: f.name,
        sizeKb: Math.max(1, Math.round(f.size / 1024)),
        category: guessDocCategory(f.name),
      })),
    ]);
  };
  const setFileCategory = (id: number, category: string) =>
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, category } : f)));
  const removeFile = (id: number) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const catOptions: SelectOption[] = DOC_CATEGORY_OPTIONS.map((o) => ({
    value: o.value,
    label: t(o.labelKey),
  }));
  const engineerOptions: SelectOption[] = ENGINEERS.map((e) => ({ value: e, label: t(e) }));

  const handleEmailChange = (v: string) => {
    setEmail(v);
    setEmailEdited(true);
    if (emailError) setEmailError("");
  };
  const handleEmailBlur = () => setEmail((v) => (v.trim() ? normalizeCorporateEmail(v) : v));

  const handleCreate = () => {
    const errs: { name?: string; leadEngineer?: string } = {};
    if (!name.trim()) errs.name = t("newProject.errName");
    if (!leadEngineer) errs.leadEngineer = t("newProject.errEngineer");
    setErrors(errs);
    const normalizedEmail = email.trim()
      ? normalizeCorporateEmail(email)
      : projectEmailAddress(name);
    if (checkEmailTaken(normalizedEmail, projects, null)) {
      setEmailError(t("email.taken"));
      return;
    }
    if (Object.keys(errs).length) return;
    setEmail(normalizedEmail);
    const deadlineDisplay = deadlineMonth ? formatDeadlineFromMonth(deadlineMonth) : null;
    const deadlineKey = deadlineDisplay
      ? locale === "uk"
        ? deadlineDisplay.uk
        : deadlineDisplay.en
      : "budget.tbd";
    const locationTrimmed = location.trim();
    onCreate({
      nameKey: name.trim(),
      leadEngineerKey: leadEngineer,
      teamKeys: team,
      deadlineKey,
      locationKey: locationTrimmed || "—",
      corporateEmail: normalizedEmail,
      files,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} size="lg">
      <DialogHeader
        title={t("newProject.title")}
        description={t("newProject.subtitle")}
        onClose={onClose}
      />
      <div className="rh-projform-body">
        <div>
          <Label>{t("newProject.name")}</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("newProject.namePh")}
            className={errors.name ? "rh-projform-input-error" : ""}
          />
          {errors.name && (
            <div className="rh-projform-field-error">
              <AlertTriangle size={12} /> {errors.name}
            </div>
          )}
        </div>
        <div>
          <Label>{t("newProject.email")}</Label>
          <Input
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={handleEmailBlur}
            placeholder="—"
            className={cx("rh-projform-input-mono", emailError && "rh-projform-input-error")}
          />
          {emailError && (
            <div className="rh-projform-field-error">
              <AlertTriangle size={12} /> {emailError}
            </div>
          )}
        </div>
        <div>
          <Label>{t("newProject.leadEngineer")}</Label>
          <Select
            value={leadEngineer}
            onChange={setLeadEngineer}
            options={engineerOptions}
            placeholder={t("newProject.leadEngineerPh")}
          />
          {errors.leadEngineer && (
            <div className="rh-projform-field-error">
              <AlertTriangle size={12} /> {errors.leadEngineer}
            </div>
          )}
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
        <div className="rh-projform-grid-2">
          <div>
            <Label>{t("newProject.deadline")}</Label>
            <Input
              type="month"
              value={deadlineMonth}
              onChange={(e) => setDeadlineMonth(e.target.value)}
            />
          </div>
          <div>
            <Label>{t("newProject.location")}</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("newProject.locationPh")}
            />
          </div>
        </div>
        <div>
          <Label>{t("newProject.files")}</Label>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            className={cx("rh-projform-dropzone", dragOver && "rh-projform-dropzone-over")}
          >
            <UploadCloud size={28} className="rh-projform-dropzone-icon" />
            <div className="rh-projform-dropzone-text">{t("upload.dropHint")}</div>
            <Button
              variant="outline"
              size="sm"
              className="rh-projform-dropzone-browse"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              <FileText size={14} /> {t("upload.browse")}
            </Button>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="rh-projform-hidden-input"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
        </div>
        <div>
          <div className="rh-projform-section-label">
            <Sparkles size={16} className="rh-projform-section-icon" />{" "}
            {t("newProject.aiCategorize")}
          </div>
          {files.length === 0 ? (
            <div className="rh-projform-files-empty">{t("newProject.filesEmpty")}</div>
          ) : (
            <div className="rh-projform-file-list">
              {files.map((f) => (
                <div key={f.id} className="rh-projform-file-row">
                  <FileText size={16} className="rh-projform-file-icon" />
                  <span className="rh-projform-file-name" title={f.name}>
                    {f.name}
                  </span>
                  <span className="rh-projform-file-size">{formatSize(f.sizeKb)}</span>
                  <Select
                    value={f.category}
                    onChange={(v) => setFileCategory(f.id, v)}
                    options={catOptions}
                    className="rh-projform-file-select"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(f.id)}
                    aria-label={`${t("action.close")}: ${f.name}`}
                    className="rh-projform-file-remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="rh-projform-footer">
        <Button variant="outline" onClick={onClose}>
          {t("newProject.cancel")}
        </Button>
        <Button variant="primary" onClick={handleCreate}>
          <Plus size={16} /> {t("newProject.create")}
        </Button>
      </div>
    </Dialog>
  );
}
