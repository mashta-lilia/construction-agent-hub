import { createContext, useContext, useId, useRef, type MouseEvent, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useI18n } from "@/hooks/useI18n";
import { X } from "@/components/Icon/icons";
import "./Dialog.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 433-452).
 * Focus-trapped via `useFocusTrap`, closes on Escape (same hook handles
 * both). Backdrop mousedown closes; the panel stops propagation so
 * clicking inside never bubbles to the backdrop handler.
 */
export type DialogSize = "sm" | "md" | "lg" | "xl";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  size?: DialogSize;
}

/**
 * Shares the title `id` Dialog generates with whatever `DialogHeader` gets
 * rendered as its child, so the panel's `aria-labelledby` actually points
 * at something -- without this, `role="dialog" aria-modal="true"` had no
 * accessible name, so a screen reader announced bare "dialog" on open.
 */
const DialogTitleIdCtx = createContext<string | null>(null);

export function Dialog({ open, onClose, children, className, size = "md" }: DialogProps) {
  const { t } = useI18n();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(open, panelRef, onClose);

  if (!open) return null;

  const handleBackdropMouseDown = () => onClose();
  const stopPropagation = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation();

  return (
    <div className="rh-dialog-overlay rh-animate-fade-in" onMouseDown={handleBackdropMouseDown}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        // Fallback for a Dialog rendered without a `DialogHeader`. Every
        // current consumer renders one under the same condition as `open`, so
        // `aria-labelledby` does resolve today -- but a dangling idref
        // computes to an EMPTY accessible name, which is worse than no
        // attribute at all. Per the accname algorithm `aria-labelledby` still
        // wins whenever it resolves to text, so this only applies when the
        // header is genuinely absent.
        aria-label={t("dialog.fallbackLabel")}
        className={cx(
          "rh-dialog-panel",
          `rh-dialog-panel-${size}`,
          "rh-animate-scale-in",
          className,
        )}
        onMouseDown={stopPropagation}
      >
        <DialogTitleIdCtx.Provider value={titleId}>{children}</DialogTitleIdCtx.Provider>
      </div>
    </div>
  );
}

export interface DialogHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  onClose: () => void;
}

export function DialogHeader({ title, description, onClose }: DialogHeaderProps) {
  const { t } = useI18n();
  const titleId = useContext(DialogTitleIdCtx);
  return (
    <div className="rh-dialog-header">
      <div>
        <div id={titleId ?? undefined} className="rh-dialog-title">
          {title}
        </div>
        {description && <div className="rh-dialog-description">{description}</div>}
      </div>
      <button onClick={onClose} aria-label={t("action.close")} className="rh-dialog-close">
        <X size={16} />
      </button>
    </div>
  );
}
