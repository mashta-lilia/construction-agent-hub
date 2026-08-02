import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { useUiStore } from "@/store/uiStore";
import { useProjectData } from "@/providers/ProjectDataProvider";
import { ROUTES } from "@/routes/paths";
import { Sidebar } from "@/components/layout/Sidebar/Sidebar";
import { TopBar, type TopBarCrumb } from "@/components/layout/TopBar/TopBar";
import { CommandPalette } from "@/components/layout/CommandPalette/CommandPalette";
import { SettingsModal } from "@/components/layout/SettingsModal/SettingsModal";
import { ProfileModal } from "@/components/layout/ProfileModal/ProfileModal";
import { ShortcutsModal } from "@/components/layout/ShortcutsModal/ShortcutsModal";
import { CookieBanner } from "@/components/layout/CookieBanner/CookieBanner";
import { Menu } from "@/components/Icon/icons";
import type { Project } from "@/features/projects";
import "./AppShell.css";

/**
 * Ported from REHUB WORK V8.html's `Dashboard` component (~lines
 * 4366-4654) -- there is no standalone `AppShell` in source, this is the
 * chrome/shell subset of `Dashboard` synthesized into its own component
 * now that `selectedId`/`view`/`mailSelectedProjectId` are real routes
 * (`routes/AppRoutes.tsx`) instead of local state. Owns exactly the
 * shell-level modal-open state and effects source's `Dashboard` owned for
 * these pieces: `settingsOpen`, `paletteOpen`, `profileOpen`,
 * `shortcutsOpen`, `cookieDismissed`, `sidebarOpen` (mobile drawer),
 * the resize/breakpoint sync effect, and the two global keyboard-shortcut
 * effects (Cmd/Ctrl+K, "?"). `sidebarCollapsed`/`navFilter`/
 * `quickAccessIds`/`searchQuery` already live in `store/uiStore.ts` (read
 * directly by `Sidebar`/`TopBar`), so they are NOT duplicated here.
 *
 * Breadcrumbs (source's `crumbs`, ~lines 4437-4444) are recomputed from the
 * current route + `useProjectData()`'s `projects` list rather than from
 * `selected`/`mailSelectedProject` local state, since those no longer
 * exist -- this is the actual architecture change from source for this
 * piece. Reuses the existing `nav.projects` i18n key for the root
 * "Projects" crumb label instead of inventing a new bilingual literal
 * (source had its own separate inline `B("Projects", "Проєкти")`) --
 * flagged as a deliberate simplification, not a guess.
 */
function useCrumbs(): TopBarCrumb[] {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const setNavFilter = useUiStore((s) => s.setNavFilter);
  const { projects } = useProjectData();

  const goToProjectsList = () => {
    setNavFilter(null);
    navigate(ROUTES.projects);
  };

  const projectDetailMatch = /^\/projects\/([^/]+)/.exec(pathname);
  if (projectDetailMatch?.[1]) {
    const project = projects.find((p) => p.id === projectDetailMatch[1]);
    return [
      { label: t("nav.projects"), onClick: goToProjectsList },
      { label: project ? t(project.nameKey) : projectDetailMatch[1] },
    ];
  }

  const mailProjectMatch = /^\/mail\/([^/]+)/.exec(pathname);
  if (mailProjectMatch?.[1]) {
    const project = projects.find((p) => p.id === mailProjectMatch[1]);
    return [
      { label: t("mail.overviewTitle"), onClick: () => navigate(ROUTES.mail) },
      { label: project ? t(project.nameKey) : mailProjectMatch[1] },
    ];
  }

  if (pathname === ROUTES.mail) {
    return [{ label: t("mail.overviewTitle") }];
  }

  if (pathname === ROUTES.activity) {
    return [
      { label: t("nav.projects"), onClick: goToProjectsList },
      { label: t("nav.activityFeed") },
    ];
  }

  return [{ label: t("nav.projects") }];
}

export function AppShell() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { ensureProjectData } = useProjectData();
  const crumbs = useCrumbs();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [cookieDismissed, setCookieDismissed] = useState(false);

  /* Keep the sidebar collapsed on small screens and expanded on desktop,
     re-syncing only when the md breakpoint is actually crossed so a manual
     toggle inside one breakpoint is preserved (source ~lines 4413-4421). */
  const wasDesktop = useRef<boolean | null>(null);
  useEffect(() => {
    const sync = () => {
      const isDesktop = window.innerWidth >= 768;
      if (wasDesktop.current !== isDesktop) {
        wasDesktop.current = isDesktop;
        setSidebarOpen(isDesktop);
      }
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  /* Global Cmd+K / Ctrl+K shortcut for the command palette (source
     ~lines 4429-4435). */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* Global "?" shortcut opens the keyboard-shortcuts help panel -- but not
     while the user is typing into a text input/textarea/select/
     contenteditable (source ~lines 4382-4392). */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "?") return;
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName;
      const editable =
        !!el && (el.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT");
      if (editable) return;
      e.preventDefault();
      setShortcutsOpen(true);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleOpenProject = (project: Project, tab?: string) => {
    ensureProjectData(project);
    navigate(ROUTES.projectDetail(project.id, tab));
  };

  return (
    <div className="rh-app-shell">
      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label={t("sidebar.toggle")}
          title={t("sidebar.toggle")}
          className="rh-app-shell-mobile-toggle d-md-none"
        >
          <Menu size={18} />
        </button>
      )}
      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            className="rh-app-shell-scrim d-md-none rh-animate-fade-in"
          />
          <Sidebar
            className="rh-app-shell-sidebar"
            onClose={() => setSidebarOpen(false)}
            onOpenProfile={() => setProfileOpen(true)}
          />
        </>
      )}
      <div className="rh-app-shell-main">
        <TopBar
          crumbs={crumbs}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
        />
        <main className="rh-app-shell-content">
          <Outlet />
        </main>
      </div>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenProject={handleOpenProject}
      />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      {!cookieDismissed && <CookieBanner onAccept={() => setCookieDismissed(true)} />}
    </div>
  );
}
