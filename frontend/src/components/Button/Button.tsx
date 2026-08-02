import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import "./Button.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 281-292).
 */
export type ButtonVariant =
  "default" | "primary" | "destructive" | "outline" | "secondary" | "ghost";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        "rh-btn",
        `rh-btn-${variant}`,
        `rh-btn-${size}`,
        "d-inline-flex align-items-center justify-content-center",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
