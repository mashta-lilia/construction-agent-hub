import { useLayoutEffect, useState, type RefObject } from "react";

/**
 * Ported verbatim from REHUB WORK V8.html, script block 1 (~lines
 * 318-341). Computes a fixed-position popover's `{top,left,width}` from
 * its trigger button's bounding rect, keeping it in sync on scroll/resize
 * while open. Using `position: fixed` (rather than `absolute`) lets the
 * popover escape clipping by any `overflow-hidden`/`overflow-y-auto`
 * ancestor (e.g. a Dialog's scrollable body).
 */
export interface PopoverCoords {
  top: number;
  left: number;
  width: number;
}

export function usePopoverPosition(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
): PopoverCoords | null {
  const [coords, setCoords] = useState<PopoverCoords | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    const update = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, triggerRef]);

  return coords;
}
