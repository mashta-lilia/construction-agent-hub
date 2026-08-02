/**
 * Central route-path builders. Every navigation call site (Sidebar,
 * TopBar, CommandPalette, QuickAccessPanel, ActivityPage) should build
 * hrefs/`navigate()` targets through these instead of hand-writing
 * template strings, so the route shape only needs to change in one place.
 *
 * Mirrors the routes registered in `routes/AppRoutes.tsx`.
 */
export const ROUTES = {
  projects: "/",
  projectDetail: (projectId: string, tab?: string): string =>
    tab ? `/projects/${projectId}/${tab}` : `/projects/${projectId}`,
  mail: "/mail",
  mailProject: (projectId: string): string => `/mail/${projectId}`,
  activity: "/activity",
} as const;

/** Tabs available on the project detail route (source: `tab.*` i18n keys /
 * `ProjectDetail`'s tab bar) -- kept here since `routes/AppRoutes.tsx` and
 * any nav link building a project-detail href both need the same literal
 * set. */
export type ProjectDetailTab =
  "documentation" | "blueprints" | "reports" | "revisions" | "audit" | "inbox";
