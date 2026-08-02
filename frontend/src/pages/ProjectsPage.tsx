import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/providers/ToastProvider";
import { useProjectData } from "@/providers/ProjectDataProvider";
import { useUiStore } from "@/store/uiStore";
import { ROUTES } from "@/routes/paths";
import {
  ProjectsTable,
  NewProjectModal,
  type NewProjectPayload,
  type Project,
} from "@/features/projects";
import { DOC_CATEGORY_OPTIONS } from "@/features/documents";

/**
 * Route entry point for `ROUTES.projects` ("/"). Mirrors source's
 * `Dashboard`'s inline `<ProjectsTable ... />` (~line 4649) plus its
 * `handleCreateProject` (~lines 4528-4547): this page composes
 * `ProjectsTable` + `NewProjectModal`, wired to `useProjectData()`, and
 * assembles the brand-new `Project` record from the modal's payload
 * (defaults for fields the wizard doesn't collect -- `clientKey`, `risk`,
 * `phaseKey`, etc -- mirror source's `handleCreateProject` defaults
 * exactly).
 */
export default function ProjectsPage() {
  const { t } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();
  const { projects, addProject, removeProject, bulkUpdateProjects, ensureProjectData } =
    useProjectData();
  const searchQuery = useUiStore((s) => s.searchQuery);
  const navFilter = useUiStore((s) => s.navFilter);
  const setNavFilter = useUiStore((s) => s.setNavFilter);
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  const handleOpen = (project: Project) => {
    ensureProjectData(project);
    navigate(ROUTES.projectDetail(project.id));
  };

  const handleCreateProject = (payload: NewProjectPayload) => {
    const id = `PRJ-${1000 + Math.floor(Math.random() * 9000)}`;
    const newProject: Project = {
      id,
      nameKey: payload.nameKey,
      statusKey: "planning",
      budget: 0,
      updatedKey: "budget.updatedJustNow",
      hasAlert: false,
      clientKey: "—",
      leadEngineerKey: payload.leadEngineerKey,
      locationKey: payload.locationKey,
      deadlineKey: payload.deadlineKey,
      risk: "green",
      phaseKey: "Planning",
      hasDemo: false,
      teamKeys: payload.teamKeys,
      corporateEmail: payload.corporateEmail,
    };
    const seededDocs = payload.files.map((f, i) => {
      const catOpt =
        DOC_CATEGORY_OPTIONS.find((o) => o.value === f.category) ?? DOC_CATEGORY_OPTIONS[1];
      const m = /\.([a-zA-Z0-9]+)$/.exec(f.name);
      return {
        id: Date.now() + i,
        name: f.name,
        type: m?.[1] ? m[1].toUpperCase() : "FILE",
        sectionKey: catOpt?.labelKey ?? "folders.other",
        sizeKb: f.sizeKb,
        authorKey: payload.leadEngineerKey,
        date: "24.07.2026",
        isNew: true,
      };
    });
    addProject(newProject, { documents: seededDocs, reports: [] });
    setNewProjectOpen(false);
    toast(t("toast.projectCreated", { n: t(newProject.nameKey) }), "success", () => {
      removeProject(id);
    });
  };

  return (
    <>
      <ProjectsTable
        projects={projects}
        onOpen={handleOpen}
        query={searchQuery}
        navFilter={navFilter}
        onClearNavFilter={() => setNavFilter(null)}
        onNewProject={() => setNewProjectOpen(true)}
        onBulkUpdateProjects={bulkUpdateProjects}
      />
      <NewProjectModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        onCreate={handleCreateProject}
        projects={projects}
      />
    </>
  );
}
