import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectData } from "@/providers/ProjectDataProvider";
import { ProjectMailboxesOverview } from "@/features/inbox";
import { ROUTES } from "@/routes/paths";
import type { Project } from "@/features/projects";

/**
 * Route entry point for `ROUTES.mail` ("/mail") -- the global "Project
 * Mailboxes" overview (Sidebar -> Mail). Mirrors source's eager-seed
 * effect (`Dashboard` ~lines 4415-4423): every project's data slice is
 * ensured up front so the overview shows real per-project inbox counts,
 * not just whichever project happens to already be open.
 */
export default function MailPage() {
  const navigate = useNavigate();
  const { projects, projectDataById, ensureProjectData } = useProjectData();

  useEffect(() => {
    projects.forEach((p) => ensureProjectData(p));
  }, [projects, ensureProjectData]);

  return (
    <ProjectMailboxesOverview
      projects={projects}
      projectDataById={projectDataById}
      onOpenMailbox={(project: Project) => navigate(ROUTES.mailProject(project.id))}
    />
  );
}
