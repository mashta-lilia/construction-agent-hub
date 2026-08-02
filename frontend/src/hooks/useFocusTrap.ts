import { useEffect, type RefObject } from "react";

/**
 * Ported verbatim from REHUB WORK V8.html, script block 1 (~lines
 * 409-432). Traps Tab focus within `panelRef`'s subtree while `open`, and
 * closes on Escape via `onClose`. Used by both Dialog and Sheet.
 */
function isFocusable(el: Element): el is HTMLElement {
  return el instanceof HTMLElement && !el.hasAttribute("disabled") && el.offsetParent !== null;
}

export function useFocusTrap(
  open: boolean,
  panelRef: RefObject<HTMLElement | null>,
  onClose: () => void,
): void {
  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;

    const getFocusables = (): HTMLElement[] => {
      if (!panelRef.current) return [];
      const nodes = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      return Array.from(nodes).filter(isFocusable);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const focusables = getFocusables();
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const focusTimer = setTimeout(() => {
      getFocusables()[0]?.focus();
    }, 10);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(focusTimer);
      trigger?.focus();
    };
  }, [open, panelRef, onClose]);
}
