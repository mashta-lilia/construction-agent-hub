import type { ReactNode, SVGProps } from "react";
import { cx } from "@/lib/cx";
import "./Icon.css";

/**
 * Generic icon wrapper, ported from REHUB WORK V8.html script block 1
 * (~lines 220-222). The original defaulted every icon to Tailwind's
 * `w-4 h-4` (= 1rem = 16px) and let call sites override with classes like
 * `w-5 h-5`. Since Tailwind isn't available here, sizing is exposed as an
 * explicit `size` prop (pixels) instead of size-utility class names --
 * every one of the ~50 icons in icons.tsx forwards it unchanged.
 */
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  size?: number;
}

export function Icon({
  size = 16,
  className,
  children,
  ...rest
}: IconProps & { children?: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={cx("rh-icon", className)}
      {...rest}
    >
      {children}
    </svg>
  );
}
