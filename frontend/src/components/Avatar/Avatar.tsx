import { cx } from "@/lib/cx";
import "./Avatar.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~line 308).
 */
export interface AvatarProps {
  initials: string;
  className?: string;
}

export function Avatar({ initials, className }: AvatarProps) {
  return <div className={cx("rh-avatar", className)}>{initials}</div>;
}
