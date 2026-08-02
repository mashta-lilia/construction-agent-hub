import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cx } from "@/lib/cx";
import { useI18n } from "@/hooks/useI18n";
import { Avatar } from "@/components/Avatar/Avatar";
import {
  HardHat,
  Briefcase,
  Mail,
  Activity,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "@/components/Icon/icons";
import { PROJECTS, CURRENT_USER_NAME_KEY } from "@/features/projects";
import { useUiStore, matchesNavFilter, type NavFilter } from "@/store/uiStore";
import { ROUTES } from "@/routes/paths";
import {
  NavSection,
  type NavItem,
  type NavCounts,
} from "@/components/layout/NavSection/NavSection";
import { QuickAccessPanel } from "@/components/layout/QuickAccessPanel/QuickAccessPanel";
import "./Sidebar.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 1624-1637 for
 * `NAV_TREE`, ~lines 1723-1762 for `Sidebar` itself).
 */
const NAV_TREE: NavItem[] = [
  {
    labelKey: "nav.projects",
    icon: Briefcase,
    expandable: true,
    defaultOpen: true,
    resetsFilter: true,
    children: [
      { labelKey: "nav.activeSites", filter: "active" },
      { labelKey: "nav.onHold", filter: "onHold" },
      { labelKey: "nav.completed", filter: "completed" },
    ],
  },
  { labelKey: "nav.mail", icon: Mail, expandable: false, action: "openMail" },
  { labelKey: "nav.activityFeed", icon: Activity, expandable: false, action: "openActivity" },
];

export interface SidebarProps {
  className?: string;
  onClose: () => void;
  onOpenProfile: () => void;
}

export function Sidebar({ className, onClose, onOpenProfile }: SidebarProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);
  const navFilter = useUiStore((s) => s.navFilter);
  const setNavFilter = useUiStore((s) => s.setNavFilter);
  const quickAccessIds = useUiStore((s) => s.quickAccessIds);
  const addToQuickAccess = useUiStore((s) => s.addToQuickAccess);
  const removeFromQuickAccess = useUiStore((s) => s.removeFromQuickAccess);

  const quickAccessProjects = useMemo(
    () =>
      quickAccessIds.map((id) => PROJECTS.find((p) => p.id === id)).filter((p) => p !== undefined),
    [quickAccessIds],
  );

  const counts: NavCounts = useMemo(
    () => ({
      active: PROJECTS.filter((p) => matchesNavFilter(p, "active")).length,
      onHold: PROJECTS.filter((p) => matchesNavFilter(p, "onHold")).length,
      completed: PROJECTS.filter((p) => matchesNavFilter(p, "completed")).length,
    }),
    [],
  );

  /* A sidebar filter always returns to the (filtered) project list --
     source ~lines 4501-4507 (`handleNavFilter`). */
  const handleFilter = (filter: NavFilter) => {
    setNavFilter(filter);
    navigate(ROUTES.projects);
    try {
      if (window.innerWidth < 768) onClose();
    } catch {
      /* ignore (non-browser environment) */
    }
  };

  const handleAction = (action: NonNullable<NavItem["action"]>) => {
    if (action === "openMail") navigate(ROUTES.mail);
    if (action === "openActivity") navigate(ROUTES.activity);
    try {
      if (window.innerWidth < 768) onClose();
    } catch {
      /* ignore (non-browser environment) */
    }
  };

  return (
    <aside
      className={cx(
        "rh-sidebar",
        collapsed ? "rh-sidebar-collapsed" : "rh-sidebar-expanded",
        className,
      )}
    >
      <div
        className={cx(
          "rh-sidebar-brand",
          collapsed ? "rh-sidebar-brand-collapsed" : "rh-sidebar-brand-expanded",
        )}
      >
        <div className="rh-sidebar-logo">
          <HardHat size={20} className="rh-sidebar-logo-icon" />
        </div>
        <div
          className={cx("rh-sidebar-brand-text", collapsed && "rh-sidebar-brand-text-collapsed")}
        >
          <div className="rh-sidebar-brand-name">RECONSTRUCTION HUB</div>
          <div className="rh-sidebar-brand-tagline">{t("brand.tagline")}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          title={t("sidebar.toggle")}
          className={cx("rh-sidebar-mobile-close", collapsed && "rh-sidebar-mobile-close-hidden")}
        >
          <X size={16} />
        </button>
      </div>
      <div className="rh-sidebar-collapse-row">
        <button
          type="button"
          onClick={toggleCollapsed}
          title={t("sidebar.toggle")}
          aria-label={t("sidebar.toggle")}
          className="rh-sidebar-collapse-btn"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>
      <nav
        className={cx(
          "rh-sidebar-nav",
          collapsed ? "rh-sidebar-nav-collapsed" : "rh-sidebar-nav-expanded",
        )}
      >
        {NAV_TREE.map((item) => (
          <NavSection
            key={item.labelKey}
            item={item}
            navFilter={navFilter}
            onFilter={handleFilter}
            onAction={handleAction}
            counts={counts}
            collapsed={collapsed}
          />
        ))}
        <QuickAccessPanel
          collapsed={collapsed}
          quickAccessProjects={quickAccessProjects}
          onOpenQuickAccess={(p) => navigate(ROUTES.projectDetail(p.id))}
          onAddToQuickAccess={addToQuickAccess}
          onRemoveFromQuickAccess={removeFromQuickAccess}
        />
      </nav>
      <div className="rh-sidebar-footer">
        <button
          type="button"
          onClick={onOpenProfile}
          title={t("menu.profile")}
          className={cx("rh-sidebar-profile-btn", collapsed && "rh-sidebar-profile-btn-collapsed")}
        >
          <Avatar initials="ВК" className="rh-sidebar-avatar" />
          <div
            className={cx(
              "rh-sidebar-profile-text",
              collapsed && "rh-sidebar-profile-text-collapsed",
            )}
          >
            <div className="rh-sidebar-profile-name">{t(CURRENT_USER_NAME_KEY)}</div>
            <div className="rh-sidebar-profile-role">{t("card.leadEngineer")}</div>
          </div>
        </button>
      </div>
    </aside>
  );
}
