import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useProjectData } from "@/providers/ProjectDataProvider";
import { ROUTES, type ProjectDetailTab } from "@/routes/paths";
import { ProjectDetail, ProjectDetailSkeleton } from "@/features/projects";

const VALID_TABS: readonly ProjectDetailTab[] = [
  "documentation",
  "blueprints",
  "reports",
  "revisions",
  "audit",
  "inbox",
];

function isProjectDetailTab(value: string | undefined): value is ProjectDetailTab {
  return !!value && (VALID_TABS as readonly string[]).includes(value);
}

/**
 * Route entry point for `ROUTES.projectDetail` ("/projects/:projectId/:tab?").
 * Mirrors source's `Dashboard`'s `openProject`/`openingProject` transition
 * (~lines 4493-4498, 4600-4602): a brief skeleton renders for ~380ms right
 * after a project is opened (or after `projectId` changes to a different
 * project), then the real `ProjectDetail` takes over. Redirects to
 * `ROUTES.projects` if `projectId` doesn't match any known project.
 */
export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { projectId, tab } = useParams<{ projectId: string; tab?: string }>();
  const { projects, projectDataById, ensureProjectData, getDataSetter, updateProject } =
    useProjectData();
  const project = projects.find((p) => p.id === projectId);

  const [opening, setOpening] = useState(true);
  useEffect(() => {
    if (!project) return;
    ensureProjectData(project);
    setOpening(true);
    const tm = setTimeout(() => setOpening(false), 380);
    return () => clearTimeout(tm);
    // Re-run the opening transition whenever the SELECTED PROJECT changes (not on every
    // `project` object identity change from unrelated data mutations), matching source's
    // `openProject` being the only thing that ever set `openingProject` back to `true`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  if (!project) {
    return <Navigate to={ROUTES.projects} replace />;
  }

  const data = projectDataById[project.id];
  if (opening || !data) {
    return <ProjectDetailSkeleton />;
  }

  return (
    <ProjectDetail
      key={project.id}
      project={project}
      projects={projects}
      data={data}
      setDocuments={getDataSetter(project.id, "documents")}
      setReports={getDataSetter(project.id, "reports")}
      setAudit={getDataSetter(project.id, "audit")}
      setRevisions={getDataSetter(project.id, "revisions")}
      setResolution={getDataSetter(project.id, "resolution")}
      setInboxMessages={getDataSetter(project.id, "inboxMessages")}
      setSentMessages={getDataSetter(project.id, "sentMessages")}
      setSpamMessages={getDataSetter(project.id, "spamMessages")}
      onBack={() => navigate(ROUTES.projects)}
      onUpdateProject={(patch) => updateProject(project.id, patch)}
      initialTab={isProjectDetailTab(tab) ? tab : undefined}
    />
  );
}
