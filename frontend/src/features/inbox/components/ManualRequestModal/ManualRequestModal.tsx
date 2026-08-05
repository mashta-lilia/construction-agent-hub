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
import "@/features/inbox/inbox.css";
import { formatSize } from "@/lib/format";
import { Dialog, DialogHeader } from "@/components/Dialog/Dialog";
import { Label } from "@/components/Label/Label";
import { Textarea } from "@/components/Textarea/Textarea";
import { Button } from "@/components/Button/Button";
import { FileText, Paperclip, Sparkles, UploadCloud } from "@/components/Icon/icons";

/**
 * Ported from REHUB WORK V8.html, script block 5, lines ~3150-3203.
 *
 * Creates a real inbox email that triggers the substitution wizard --
 * `onStart` is the callback the composing parent (`ProjectDetail`/
 * `Dashboard`) uses to turn this payload into an actual inbox message
 * and open `SubstitutionFlow` (features/norms). This component never
 * imports anything from features/norms itself.
 */
export interface ManualRequestAttachment {
  id: number;
  name: string;
  sizeKb: number;
}

export interface ManualRequestPayload {
  desc: string;
  files: ManualRequestAttachment[];
}

export interface ManualRequestModalProps {
  open: boolean;
  onClose: () => void;
  onStart: (payload: ManualRequestPayload) => void;
}

export function ManualRequestModal({ open, onClose, onStart }: ManualRequestModalProps) {
  const { t } = useI18n();
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState<ManualRequestAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDesc("");
      setFiles([]);
      setDragOver(false);
    }
  }, [open]);

  const addFiles = (fileList: FileList | null | undefined) => {
    const incoming = Array.from(fileList ?? []);
    if (!incoming.length) return;
    setFiles((prev) => [
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

  const handleBrowseClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    openPicker();
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <Dialog open={open} onClose={onClose} size="lg">
      <DialogHeader
        title={t("manual.title")}
        description={t("manual.subtitle")}
        onClose={onClose}
      />
      <div className="rh-inbox-manual-body">
        <div>
          <Label>{t("manual.descLabel")}</Label>
          <Textarea
            rows={5}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={t("manual.descPh")}
          />
        </div>
        <div>
          <Label>{t("manual.attachments")}</Label>
          <div
            onClick={openPicker}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cx("rh-inbox-dropzone", dragOver && "rh-inbox-dropzone-active")}
          >
            <UploadCloud size={28} className="rh-inbox-dropzone-icon" />
            <div className="rh-inbox-dropzone-text">{t("upload.dropHint")}</div>
            <Button
              variant="outline"
              size="sm"
              className="rh-inbox-dropzone-browse"
              onClick={handleBrowseClick}
            >
              <FileText size={14} /> {t("upload.browse")}
            </Button>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="rh-inbox-hidden-input"
              onChange={handleFileInputChange}
            />
          </div>
          {files.length > 0 && (
            <div className="rh-inbox-attachment-list rh-animate-fade-in">
              {files.map((f) => (
                <div key={f.id} className="rh-inbox-attachment">
                  <Paperclip size={14} className="rh-inbox-attachment-icon" />
                  <span className="rh-inbox-attachment-name">{f.name}</span>
                  <span className="rh-inbox-attachment-size">{formatSize(f.sizeKb)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="d-flex justify-content-end gap-2 rh-inbox-manual-footer">
        <Button variant="outline" onClick={onClose}>
          {t("consent.cancel")}
        </Button>
        <Button variant="primary" onClick={() => onStart({ desc, files })}>
          <Sparkles size={16} /> {t("manual.start")}
        </Button>
      </div>
    </Dialog>
  );
}
