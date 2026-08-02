import type { HTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import "./Alert.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 304-307).
 */
export type AlertVariant = "default" | "red" | "amber" | "green";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

export function Alert({ variant = "default", className, children, ...props }: AlertProps) {
  return (
    <div className={cx("rh-alert", `rh-alert-${variant}`, className)} {...props}>
      {children}
    </div>
  );
}
