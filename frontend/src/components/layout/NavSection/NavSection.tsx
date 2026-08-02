import { useState, type ComponentType } from "react";
import { cx } from "@/lib/cx";
import { useI18n } from "@/hooks/useI18n";
import { ChevronDown } from "@/components/Icon/icons";
import type { IconProps } from "@/components/Icon/Icon";
import type { NavFilter } from "@/store/uiStore";
import "./NavSection.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 1624-1678):
 * `NAV_TREE`'s shape + `NavSection`. `NAV_TREE` itself now lives in
 * `Sidebar.tsx` (its only consumer) rather than here, since it references
 * icons/action strings specific to Sidebar's wiring.
 */
export interface NavChild {
  labelKey: string;
  filter: Exclude<NavFilter, null>;
}

export interface NavItem {
  labelKey: string;
  icon: ComponentType<IconProps>;
  expandable: boolean;
  defaultOpen?: boolean;
  resetsFilter?: boolean;
  action?: "openMail" | "openActivity";
  children?: NavChild[];
}

export type NavCounts = Partial<Record<Exclude<NavFilter, null>, number>>;

export interface NavSectionProps {
  item: NavItem;
  navFilter: NavFilter;
  onFilter: (filter: NavFilter) => void;
  onAction: (action: NonNullable<NavItem["action"]>) => void;
  counts?: NavCounts;
  collapsed: boolean;
}

/**
 * Single render path regardless of `collapsed` -- only the container
 * classes and the label's own width/opacity animate. The icon element
 * itself never unmounts and always keeps the same size, so
 * collapsing/expanding never jitters or resizes it (source comment ~line
 * 1649-1651, preserved verbatim below since it documents a real,
 * previously-debugged behavior).
 */
export function NavSection({
  item,
  navFilter,
  onFilter,
  onAction,
  counts,
  collapsed,
}: NavSectionProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(!!item.defaultOpen);
  const IconCmp = item.icon;
  const parentActive = !!item.resetsFilter && !navFilter;

  const handleParent = () => {
    if (item.action) {
      onAction(item.action);
      return;
    }
    if (item.expandable) setOpen((o) => !o);
    if (item.resetsFilter) onFilter(null);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleParent}
        title={collapsed ? t(item.labelKey) : undefined}
        aria-label={t(item.labelKey)}
        className={cx(
          "rh-nav-parent",
          collapsed ? "rh-nav-parent-collapsed" : "rh-nav-parent-expanded",
          parentActive && "rh-nav-parent-active",
        )}
      >
        <IconCmp size={20} className="rh-nav-icon" />
        <span className={cx("rh-nav-label", collapsed && "rh-nav-label-collapsed")}>
          {t(item.labelKey)}
        </span>
        {item.expandable && (
          <ChevronDown
            size={14}
            className={cx(
              "rh-nav-chevron",
              collapsed ? "rh-nav-chevron-collapsed" : "rh-nav-chevron-expanded",
              !open && !collapsed && "rh-nav-chevron-closed",
            )}
          />
        )}
      </button>
      {item.expandable && open && !collapsed && item.children && (
        <div className="rh-nav-children rh-animate-fade-in">
          {item.children.map((c) => {
            const childActive = navFilter === c.filter;
            return (
              <button
                key={c.labelKey}
                type="button"
                onClick={() => onFilter(c.filter)}
                className={cx("rh-nav-child", childActive && "rh-nav-child-active")}
              >
                <span className="rh-nav-child-label">{t(c.labelKey)}</span>
                {counts && (
                  <span
                    className={cx("rh-nav-child-count", childActive && "rh-nav-child-count-active")}
                  >
                    {counts[c.filter] ?? 0}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
