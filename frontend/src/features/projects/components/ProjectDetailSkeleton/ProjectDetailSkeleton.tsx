import { SkeletonBlock, SkeletonRows } from "@/components/Skeleton/Skeleton";
import "@/features/projects/projects.css";

/**
 * Ported from REHUB WORK V8.html, script block 8, ~lines 3982-3997.
 * Brief skeleton placeholder shown right after opening a project, before
 * the real `ProjectDetail` header+tabs render.
 */
export function ProjectDetailSkeleton() {
  return (
    <div className="rh-project-detail-skeleton">
      <SkeletonBlock className="rh-skeleton-back-link" />
      <SkeletonBlock className="rh-skeleton-title" />
      <SkeletonBlock className="rh-skeleton-subtitle" />
      <div className="rh-project-detail-skeleton-cards">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="rh-project-detail-skeleton-card" />
        ))}
      </div>
      <div className="rh-project-detail-skeleton-tabs">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock key={i} className="rh-project-detail-skeleton-tab" />
        ))}
      </div>
      <SkeletonRows />
    </div>
  );
}
