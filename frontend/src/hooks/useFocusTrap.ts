import { useEffect, useRef, type RefObject } from "react";

/**
 * Ported from REHUB WORK V8.html, script block 1 (~lines 409-432). Traps
 * Tab focus within `panelRef`'s subtree while `open`, and closes on
 * Escape via `onClose`. Used by both Dialog and Sheet.
 *
 * `el.offsetParent !== null` is the classic "is this visible" check, but
 * it's always `null` for `position: fixed` descendants (offsetParent is
 * defined relative to the nearest positioned ancestor, which a fixed
 * element escapes) -- every Dialog/Sheet here is fixed-positioned, so this
 * silently excluded their own contents from the trap. `getClientRects()`
 * reports the element's actual laid-out boxes and isn't affected by
 * `position`, so it works for fixed content too.
 */
function isFocusable(el: Element): el is HTMLElement {
  return (
    el instanceof HTMLElement && !el.hasAttribute("disabled") && el.getClientRects().length > 0
  );
}

/**
 * Stack of currently-open traps, most-recently-opened last. The keydown
 * listener below is registered on `document` by EVERY open trap, so with two
 * overlays open (e.g. a confirm Dialog on top of SubstitutionFlow) a single
 * key press reaches every trap's handler. Only the topmost entry may act:
 *
 *  - Escape: one press closes the top overlay and leaves the one underneath
 *    open, requiring a second press -- matching a native modal stack.
 *  - Tab: the inner Dialog is rendered inside the outer overlay's JSX, so it
 *    is a DOM DESCENDANT of the outer panel, and the outer trap's
 *    `getFocusables()` therefore also matches the inner dialog's controls.
 *    Both handlers used to run, and the outer one could `preventDefault()`
 *    and pull focus back to its own first element -- tabbing out of the top
 *    dialog into the overlay behind it.
 */
const trapStack: symbol[] = [];

export function useFocusTrap(
  open: boolean,
  panelRef: RefObject<HTMLElement | null>,
  onClose: () => void,
): void {
  // Every call site here passes an unmemoized inline arrow for `onClose`,
  // so it gets a new identity on every render of the owning component.
  // Reading it through a ref keeps the effect below scoped to
  // [open, panelRef] -- a parent re-render while the dialog is open no
  // longer tears down and re-runs the trap (which was pulling focus back
  // to the trigger, then re-stealing it into the panel, mid-interaction).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    const id = Symbol("focus-trap");
    trapStack.push(id);

    const getFocusables = (): HTMLElement[] => {
      if (!panelRef.current) return [];
      const nodes = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      return Array.from(nodes).filter(isFocusable);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Gate EVERY key, not just Escape: a trap that is not on top must stay
      // completely inert, or it fights the topmost trap over focus (see the
      // `trapStack` comment above).
      if (trapStack[trapStack.length - 1] !== id) return;
      if (e.key === "Escape") {
        onCloseRef.current();
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
      const stackIdx = trapStack.indexOf(id);
      if (stackIdx !== -1) trapStack.splice(stackIdx, 1);
      trigger?.focus();
    };
  }, [open, panelRef]);
}
