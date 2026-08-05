import type { InputHTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import "./Input.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~line 302).
 */
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx("rh-input", className)} {...props} />;
}
