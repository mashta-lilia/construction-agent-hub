import { cx } from "@/lib/cx";
import "./Skeleton.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 517-535).
 */
export interface SkeletonBlockProps {
  className?: string;
}

export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return <div className={cx("rh-skeleton-block", "rh-animate-shimmer", className)} />;
}

export interface SkeletonRowsProps {
  rows?: number;
}

export function SkeletonRows({ rows = 4 }: SkeletonRowsProps) {
  return (
    <div className="rh-skeleton-rows rh-animate-fade-in">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rh-skeleton-row">
          <SkeletonBlock className="rh-skeleton-row-avatar" />
          <div className="rh-skeleton-row-lines">
            <SkeletonBlock className="rh-skeleton-row-line-title" />
            <SkeletonBlock className="rh-skeleton-row-line-subtitle" />
          </div>
        </div>
      ))}
    </div>
  );
}
