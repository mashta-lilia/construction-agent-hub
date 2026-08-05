import type { HTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import "./Badge.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 297-300).
 */
export type BadgeVariant = "default" | "blue" | "green" | "amber" | "red" | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span className={cx("rh-badge", `rh-badge-${variant}`, className)} {...props}>
      {children}
    </span>
  );
}
