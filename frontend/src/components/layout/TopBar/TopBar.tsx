import { useState } from "react";
import { cx } from "@/lib/cx";
import { useI18n } from "@/hooks/useI18n";
import { useUiStore } from "@/store/uiStore";
import { CURRENT_USER_NAME_KEY } from "@/features/projects";
import { Avatar } from "@/components/Avatar/Avatar";
import {
  Search,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  User,
  LogOut,
  X,
} from "@/components/Icon/icons";
import "./TopBar.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 1765-1828).
 * Reads `searchQuery`/`setSearchQuery` directly from `useUiStore` (matches
 * how `Sidebar.tsx` already reads store state directly rather than via
 * props). Clicking the search input blurs it and opens the command
 * palette instead of typing in place (source ~line 1796) -- the actual
 * global Cmd/Ctrl+K listener lives in AppShell, not here.
 */
export interface TopBarCrumb {
  label: string;
  onClick?: () => void;
}

export interface TopBarProps {
  crumbs: TopBarCrumb[];
  onOpenSettings: () => void;
  onOpenPalette: () => void;
  onOpenProfile: () => void;
  onOpenShortcuts: () => void;
}

export function TopBar({
  crumbs,
  onOpenSettings,
  onOpenPalette,
  onOpenProfile,
  onOpenShortcuts,
}: TopBarProps) {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const searchQuery = useUiStore((s) => s.searchQuery);
  const setSearchQuery = useUiStore((s) => s.setSearchQuery);
  const userName = t(CURRENT_USER_NAME_KEY);

  return (
    <header className="rh-topbar">
      <div className="rh-topbar-crumbs">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={i} className="rh-topbar-crumb-group">
              {i > 0 && <ChevronRight size={14} className="rh-topbar-crumb-sep" />}
              {crumb.onClick ? (
                <button
                  type="button"
                  onClick={crumb.onClick}
                  className={cx(
                    "rh-topbar-crumb rh-topbar-crumb-link",
                    isLast && "rh-topbar-crumb-last",
                  )}
                >
                  {crumb.label}
                </button>
              ) : (
                <span className={cx("rh-topbar-crumb", isLast && "rh-topbar-crumb-last")}>
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </div>
      <div className="rh-topbar-actions">
        <div className="rh-topbar-search">
          <Search size={14} className="rh-topbar-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenPalette();
            }}
            placeholder={t("search.placeholder")}
            className="rh-topbar-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label={t("action.close")}
              className="rh-topbar-search-clear"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          title={t("settings.title")}
          aria-label={t("settings.title")}
          className="rh-topbar-icon-btn"
        >
          <Settings size={18} />
        </button>
        <button
          type="button"
          onClick={onOpenShortcuts}
          title={t("shortcuts.open")}
          aria-label={t("shortcuts.open")}
          className="rh-topbar-icon-btn rh-topbar-icon-btn-shortcuts"
        >
          <HelpCircle size={18} />
        </button>
        <div className="rh-topbar-user">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="rh-topbar-user-btn"
          >
            <Avatar initials="ВК" className="rh-topbar-user-avatar" />
            <ChevronDown
              size={16}
              className={cx("rh-topbar-user-chevron", menuOpen && "rh-topbar-user-chevron-open")}
            />
          </button>
          {menuOpen && (
            <>
              <div className="rh-topbar-user-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="rh-topbar-user-menu rh-animate-fade-in">
                <div className="rh-topbar-user-menu-header">
                  <div className="rh-topbar-user-menu-name">{userName}</div>
                  <div className="rh-topbar-user-menu-role">{t("card.leadEngineer")}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="rh-topbar-user-menu-item"
                >
                  <User size={16} className="rh-topbar-user-menu-icon" /> {t("menu.profile")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="rh-topbar-user-menu-item"
                >
                  <Settings size={16} className="rh-topbar-user-menu-icon" /> {t("menu.settings")}
                </button>
                <div className="rh-topbar-user-menu-divider" />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="rh-topbar-user-menu-item rh-topbar-user-menu-item-danger"
                >
                  <LogOut size={16} /> {t("menu.logout")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
