import { create } from "zustand";
import type { Project, StageKey } from "@/features/projects";

/**
 * Global client UI state (§2.1: "store/ -- Zustand stores (глобальний
 * UI/сесійний стан)"), ported from REHUB WORK V8.html's `Dashboard`
 * component (~lines 4366-4654), which held all of this as local
 * `useState`. `Dashboard` no longer exists as a single mega-component --
 * its chrome responsibilities moved to `components/layout/AppShell`, and
 * its page bodies moved to `pages/`, so state that used to live in one
 * component's closure now lives here where every consumer (Sidebar,
 * TopBar, the eventual ProjectsTable page body) can read/write it.
 *
 * Deliberately NOT included:
 *  - `selectedId` / `mailSelectedProjectId` / `view` / `initialTab`: these
 *    were how the original faked routing with local state. They're now
 *    real React Router routes/params (`routes/AppRoutes.tsx`), not UI store
 *    state.
 *  - `projectDataById` (documents/reports/audit/revisions/inbox per
 *    project): server/domain data, owned by `features/documents`,
 *    `features/reports`, `features/inbox` (§2.1: server state lives in
 *    `features/*\/services`, never duplicated into a Zustand store).
 *  - notification read/unread state: grepped the source for a bell button
 *    that would need this (`Bell` icon usage, `NOTIFICATIONS_SEED` reads)
 *    -- `TopBar` (~lines 1765-1830) never renders a notification bell in
 *    V8, so there is no client-tracked read/unread state to port. The
 *    `notif.*` i18n keys and `features/inbox`'s `NOTIFICATIONS_SEED` are
 *    unused leftovers from an earlier iteration; flagged rather than
 *    invented.
 */

/** Mirrors `matchesNavFilter`'s filter values (source ~line 1631): sidebar
 * "Projects" children filter the list to a stage bucket; `null` = no filter. */
export type NavFilter = "active" | "onHold" | "completed" | null;

/** Direct port of `matchesNavFilter` (source ~lines 1630-1637). */
export function matchesNavFilter(
  project: Pick<Project, "statusKey">,
  navFilter: NavFilter,
): boolean {
  if (!navFilter) return true;
  if (navFilter === "active") {
    const activeStages: readonly StageKey[] = ["inProgress", "planning", "audit"];
    return (activeStages as readonly string[]).includes(project.statusKey);
  }
  if (navFilter === "onHold") return project.statusKey === "onHold";
  if (navFilter === "completed") return project.statusKey === "completed";
  return true;
}

/** FIFO cap on the sidebar's Quick Access list (source ~line 4475: `next.length > 10`). */
const QUICK_ACCESS_CAP = 10;

export interface UiState {
  /* ---- sidebar collapse (desktop rail collapse/expand) ----
     Source ~line 4376: `useState(false)`, never persisted to localStorage
     (unlike theme/density/locale, which all have their own
     `localStorage.setItem` -- grepped the whole file to confirm). Kept
     in-memory only here too, matching that exactly. */
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  /* ---- sidebar nav filter (source ~line 4373) ---- */
  navFilter: NavFilter;
  setNavFilter: (filter: NavFilter) => void;

  /* ---- Quick Access (source ~lines 4470-4477) ----
     Manually curated via drag-and-drop from the projects table (or removed
     via its own "x"), ordered oldest-first so index 0 is evicted first once
     the list exceeds the FIFO cap -- NOT auto-populated by opening a
     project. */
  quickAccessIds: string[];
  addToQuickAccess: (id: string) => void;
  removeFromQuickAccess: (id: string) => void;

  /* ---- TopBar search box (source ~line 4372: `query`/`setQuery`) ----
     NOT explicitly requested by name in the task brief, but added because
     TopBar's search input (source ~lines 1790-1805) needs a home for its
     controlled value, and the original wired the exact same `query` state
     into ProjectsTable's own inline search prop. Kept here (rather than
     page-local state) so the eventual ProjectsTable page body can read the
     same value TopBar's box displays/clears, matching the original
     single-source-of-truth wiring. Flagged in the handoff report. */
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  navFilter: null,
  setNavFilter: (filter) => set({ navFilter: filter }),

  quickAccessIds: [],
  addToQuickAccess: (id) =>
    set((s) => {
      if (!id || s.quickAccessIds.includes(id)) return s;
      const next = [...s.quickAccessIds, id];
      return {
        quickAccessIds:
          next.length > QUICK_ACCESS_CAP ? next.slice(next.length - QUICK_ACCESS_CAP) : next,
      };
    }),
  removeFromQuickAccess: (id) =>
    set((s) => ({ quickAccessIds: s.quickAccessIds.filter((x) => x !== id) })),

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
