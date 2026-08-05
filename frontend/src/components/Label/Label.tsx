import type { LabelHTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import "./Label.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~line 301).
 */
export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cx("rh-label", className)} {...props} />;
}
