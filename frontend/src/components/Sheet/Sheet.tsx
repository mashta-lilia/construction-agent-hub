import { useRef, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import "./Sheet.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 454-466).
 * Slide-out panel primitive, same focus-trap/Escape behavior as Dialog.
 * `widthClass` in the source was a Tailwind responsive width string
 * (`"w-full sm:w-[45%]"`); here it is a plain CSS width value (defaults to
 * the same 45% desktop / 100% mobile behavior via `.rh-sheet-panel`'s
 * `clamp()`).
 */
export interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  widthClass?: string;
}

export function Sheet({ open, onClose, children, className, widthClass }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, panelRef, onClose);

  if (!open) return null;

  return (
    <div className="rh-sheet-overlay">
      <div className="rh-sheet-backdrop rh-animate-fade-in" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        style={widthClass ? { width: widthClass } : undefined}
        className={cx("rh-sheet-panel", "rh-animate-slide-in", className)}
      >
        {children}
      </div>
    </div>
  );
}
