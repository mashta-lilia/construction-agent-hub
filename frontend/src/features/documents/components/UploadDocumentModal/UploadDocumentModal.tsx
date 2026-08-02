import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type MouseEvent,
} from "react";
import { useI18n } from "@/hooks/useI18n";
import { cx } from "@/lib/cx";
import { formatSize } from "@/lib/format";
import { Dialog, DialogHeader } from "@/components/Dialog/Dialog";
import { Select } from "@/components/Select/Select";
import { Button } from "@/components/Button/Button";
import { FileText, Sparkles, UploadCloud, X } from "@/components/Icon/icons";
import { DOC_CATEGORY_OPTIONS, guessDocCategory } from "@/features/documents/constants/data";
import type { ProjectDocument } from "@/features/documents/types";
import "@/features/documents/documents.css";

/**
 * Ported from REHUB WORK V8.html, script block 6, lines ~2239-2322.
 *
 * Per-file AI category guess (`guessDocCategory`) runs as soon as a file is
 * dropped/picked; the user can override the guess via the per-row `Select`
 * before confirming with "Done". `onUpload` receives the finished
 * `ProjectDocument[]` -- the caller (`DocumentationTab`) appends them to its
 * `documents` state.
 */
interface PendingFile {
  id: number;
  name: string;
  type: string;
  sizeKb: number;
  category: string;
}

export interface UploadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (docs: ProjectDocument[]) => void;
}

function extOf(name: string): string {
  const m = /\.([a-zA-Z0-9]+)$/.exec(name);
  return m?.[1] ? m[1].toUpperCase() : "FILE";
}

/** Faithful port of the source's hardcoded "current date" for newly uploaded
 * files (script block 6, ~line 2262) -- the prototype never derived this
 * from `Date.now()`, only file IDs did. */
const UPLOAD_DATE = "24.07.2026";

/** Same author every uploaded document gets attributed to in the source
 * (`B("Volodymyr Kuzemko", "Володимир Куземко")`, script block 6, ~line
 * 2269) -- this is the app's single (lead engineer) user, so it maps to
 * the shared `CURRENT_USER_NAME_KEY` i18n key rather than a new one. */
const UPLOAD_AUTHOR_KEY = "projects.seed.prj1042.leadEngineer";

export function UploadDocumentModal({ open, onClose, onUpload }: UploadDocumentModalProps) {
  const { t } = useI18n();
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setFiles([]);
  }, [open]);

  const addFiles = (fileList: FileList | null | undefined) => {
    const incoming = Array.from(fileList ?? []);
    if (!incoming.length) return;
    setFiles((prev) => [
      ...prev,
      ...incoming.map((f, i) => ({
        id: Date.now() + i,
        name: f.name,
        type: extOf(f.name),
        sizeKb: Math.max(1, Math.round(f.size / 1024)),
        category: guessDocCategory(f.name),
      })),
    ]);
  };

  const setFileCategory = (id: number, category: string) =>
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, category } : f)));
  const removeFile = (id: number) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const catOptions = DOC_CATEGORY_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }));

  const openPicker = () => inputRef.current?.click();
  const handleBrowseClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    openPicker();
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDone = () => {
    if (files.length) {
      const newDocs: ProjectDocument[] = files.map((f) => {
        // `noUncheckedIndexedAccess` makes a fixed-index fallback read
        // `| undefined`; `DOC_CATEGORY_OPTIONS` is a constant 4-item array
        // (see constants/data.ts) so index 1 ("documentation") always
        // exists -- non-null assertion here matches the source's untyped
        // `|| DOC_CATEGORY_OPTIONS[1]` fallback (script block 6, ~line 2262).
        const catOpt =
          DOC_CATEGORY_OPTIONS.find((o) => o.value === f.category) ?? DOC_CATEGORY_OPTIONS[1]!;
        return {
          id: f.id,
          name: f.name,
          type: f.type,
          sectionKey: catOpt.labelKey,
          sizeKb: f.sizeKb,
          authorKey: UPLOAD_AUTHOR_KEY,
          date: UPLOAD_DATE,
          isNew: true,
        };
      });
      onUpload(newDocs);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} size="md">
      <DialogHeader
        title={t("upload.title")}
        description={t("upload.subtitle")}
        onClose={onClose}
      />
      <div className="rh-doc-upload-body">
        <div
          onClick={openPicker}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cx("rh-doc-dropzone", dragOver && "rh-doc-dropzone-active")}
        >
          <UploadCloud size={32} className="rh-doc-dropzone-icon" />
          <div className="rh-doc-dropzone-text">{t("upload.dropHint")}</div>
          <Button
            variant="outline"
            size="sm"
            className="rh-doc-dropzone-browse"
            onClick={handleBrowseClick}
          >
            <FileText size={14} /> {t("upload.browse")}
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="rh-doc-hidden-input"
            onChange={handleFileInputChange}
          />
        </div>

        {files.length > 0 && (
          <div className="rh-doc-upload-list rh-animate-fade-in">
            <div className="rh-doc-upload-list-label">
              <Sparkles size={14} className="rh-doc-upload-list-label-icon" /> {t("upload.added")}
            </div>
            {files.map((f) => (
              <div key={f.id} className="rh-doc-upload-row">
                <FileText size={16} className="rh-doc-upload-row-icon" />
                <span className="rh-doc-upload-row-name" title={f.name}>
                  {f.name}
                </span>
                <span className="rh-doc-upload-row-size">{formatSize(f.sizeKb)}</span>
                <Select
                  value={f.category}
                  onChange={(v) => setFileCategory(f.id, v)}
                  options={catOptions}
                  className="rh-doc-upload-row-select"
                />
                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  aria-label={`${t("action.close")}: ${f.name}`}
                  className="rh-doc-upload-row-remove"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="rh-doc-upload-footer">
        <Button variant="secondary" onClick={handleDone}>
          {t("upload.done")}
        </Button>
      </div>
    </Dialog>
  );
}
