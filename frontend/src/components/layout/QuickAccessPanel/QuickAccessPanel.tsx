import { useState, type DragEvent } from "react";
import { cx } from "@/lib/cx";
import { useI18n } from "@/hooks/useI18n";
import { Briefcase, X } from "@/components/Icon/icons";
import type { Project } from "@/features/projects";
import "./QuickAccessPanel.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 1679-1722).
 * Drag-and-drop drop target (the drag SOURCE is `ProjectsTable`'s rows,
 * built by the `features/projects` sibling agent -- out of scope here,
 * this only needs to read `e.dataTransfer.getData("text/plain")` as a
 * project id, matching the source's contract).
 */
export interface QuickAccessPanelProps {
  collapsed: boolean;
  quickAccessProjects: Project[];
  onOpenQuickAccess: (project: Project) => void;
  onAddToQuickAccess: (id: string) => void;
  onRemoveFromQuickAccess: (id: string) => void;
}

export function QuickAccessPanel({
  collapsed,
  quickAccessProjects,
  onOpenQuickAccess,
  onAddToQuickAccess,
  onRemoveFromQuickAccess,
}: QuickAccessPanelProps) {
  const { t } = useI18n();
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (id) onAddToQuickAccess(id);
  };

  return (
    <div
      className={cx(
        "rh-quick-access",
        collapsed ? "rh-quick-access-collapsed" : "rh-quick-access-expanded",
      )}
    >
      <div className="rh-quick-access-heading">{t("sidebar.quickAccess")}</div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setDragOver(true)}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cx("rh-quick-access-dropzone", dragOver && "rh-quick-access-dropzone-over")}
      >
        {quickAccessProjects.length === 0 ? (
          <div className="rh-quick-access-hint">{t("sidebar.quickAccessHint")}</div>
        ) : (
          <div className="rh-quick-access-list">
            {quickAccessProjects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onOpenQuickAccess(p)}
                className="rh-quick-access-item"
              >
                <Briefcase size={14} className="rh-quick-access-item-icon" />
                <span className="rh-quick-access-item-label">{t(p.nameKey)}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromQuickAccess(p.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      e.preventDefault();
                      onRemoveFromQuickAccess(p.id);
                    }
                  }}
                  aria-label={t("sidebar.quickAccessRemoveAria", { p: t(p.nameKey) })}
                  className="rh-quick-access-item-remove"
                >
                  <X size={12} />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
