import type { HTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import "./Card.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 293-296).
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("rh-card", className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("rh-card-header", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cx("rh-card-title", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("rh-card-content", className)} {...props} />;
}
