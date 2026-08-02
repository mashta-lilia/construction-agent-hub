import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { useI18n } from "@/hooks/useI18n";
import { CheckCircle2, AlertTriangle } from "@/components/Icon/icons";
import "./ToastProvider.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 469-506).
 * `onUndo` is fully supported: passing it renders a working "Undo" link
 * in the toast that both invokes the callback and dismisses the toast.
 */
export type ToastVariant = "success" | "error";

export interface ToastEntry {
  id: number;
  message: string;
  variant: ToastVariant;
  onUndo?: () => void;
}

export type PushToast = (message: string, variant?: ToastVariant, onUndo?: () => void) => number;

const ToastCtx = createContext<PushToast | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const dismiss = (id: number) => {
    setToasts((ts) => ts.filter((x) => x.id !== id));
    const timer = timersRef.current[id];
    if (timer) {
      clearTimeout(timer);
      delete timersRef.current[id];
    }
  };

  const push: PushToast = (message, variant = "success", onUndo) => {
    const id = ++idRef.current;
    setToasts((ts) => [...ts, { id, message, variant, onUndo }]);
    timersRef.current[id] = setTimeout(() => dismiss(id), 4200);
    return id;
  };

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="rh-toast-viewport">
        {toasts.map((toast) => (
          <div key={toast.id} className="rh-toast rh-animate-toast-in">
            <div
              className={cx(
                "rh-toast-icon",
                toast.variant === "success" ? "rh-toast-icon-success" : "rh-toast-icon-error",
              )}
            >
              {toast.variant === "success" ? (
                <CheckCircle2 size={16} className="rh-toast-icon-svg" />
              ) : (
                <AlertTriangle size={16} className="rh-toast-icon-svg" />
              )}
            </div>
            <span className="rh-toast-message">{toast.message}</span>
            {toast.onUndo && (
              <button
                type="button"
                onClick={() => {
                  toast.onUndo?.();
                  dismiss(toast.id);
                }}
                className="rh-toast-undo"
              >
                {t("toast.undo")}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast(): PushToast {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
