import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell/AppShell";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import MailPage from "@/pages/MailPage";
import MailProjectPage from "@/pages/MailProjectPage";
import ActivityPage from "@/pages/ActivityPage";

/**
 * Route configuration, per CLAUDE-WORKFLOW.md §2.1 ("уся конфігурація
 * маршрутів на React Router, не розкидана по App.tsx/сторінках"). Every
 * page is nested under the `AppShell` layout route so Sidebar/TopBar
 * persist across navigation, matching how source's `Dashboard` always
 * rendered Sidebar+TopBar around whichever body it picked
 * (REHUB WORK V8.html ~lines 4540-4650).
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/projects/:projectId/:tab?" element={<ProjectDetailPage />} />
        <Route path="/mail" element={<MailPage />} />
        <Route path="/mail/:projectId" element={<MailProjectPage />} />
        <Route path="/activity" element={<ActivityPage />} />
      </Route>
    </Routes>
  );
}
