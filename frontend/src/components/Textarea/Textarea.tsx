import type { TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import "./Textarea.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~line 303).
 */
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx("rh-textarea", className)} {...props} />;
}
