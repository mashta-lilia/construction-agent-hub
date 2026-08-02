import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { PROJECTS, type Project } from "@/features/projects";
import {
  makeBlueprints,
  makeDocuments,
  type Blueprint,
  type ProjectDocument,
} from "@/features/documents";
import { makeReports, type Report } from "@/features/reports";
import { makeAudit, makeRevisions, type AuditEntry, type RevisionEntry } from "@/features/norms";
import { makeInboxMessages, type InboxMessage } from "@/features/inbox";

/**
 * Minimal port of `Dashboard`'s `projects`/`projectDataById` state
 * (REHUB WORK V8.html ~lines 4368-4369, 4419-4420) plus its lazy
 * `makeProjectData` factory (~lines 4517-4529). `Dashboard` no longer
 * exists as a single component -- `selectedId`/`view`/`mailSelectedProjectId`
 * became real routes (`routes/AppRoutes.tsx`), so this provider is what
 * every route-driven page (`ProjectDetailPage`, `MailPage`,
 * `MailProjectPage`) reads/writes instead of one component's closure.
 *
 * Deliberately minimal for this pass (per task brief): full per-tab wiring
 * (documents/reports/audit setters actually consumed by
 * ProjectDetail/DocumentationTab/etc) is out of scope -- this only
 * establishes the shape (lazy per-project slice + a generic setter) so a
 * later pass can plug in the remaining tabs without re-architecting.
 */
export interface ProjectDataSlice {
  documents: ProjectDocument[];
  blueprints: Blueprint[];
  reports: Report[];
  audit: AuditEntry[];
  revisions: RevisionEntry[];
  inboxMessages: InboxMessage[];
  sentMessages: InboxMessage[];
  spamMessages: InboxMessage[];
  /** Substitution-flow resolution state (features/norms) -- typed loosely
   * since that shape is owned by a feature not yet wired into this
   * provider; a later pass can narrow this. */
  resolution: unknown | null;
}

function makeProjectData(project: Project): ProjectDataSlice {
  return {
    documents: makeDocuments(),
    blueprints: makeBlueprints(),
    reports: makeReports(),
    audit: makeAudit(project),
    revisions: makeRevisions(project),
    inboxMessages: makeInboxMessages(project),
    sentMessages: [],
    spamMessages: [],
    resolution: null,
  };
}

export type ProjectDataUpdater<K extends keyof ProjectDataSlice> =
  ProjectDataSlice[K] | ((prev: ProjectDataSlice[K]) => ProjectDataSlice[K]);

interface ProjectDataContextValue {
  projects: Project[];
  projectDataById: Record<string, ProjectDataSlice | undefined>;
  /** Lazily creates a project's data slice if it doesn't exist yet (source's
   * `openProject`/mail-overview eager-seed effect, ~lines 4415-4423). Safe to
   * call redundantly -- a no-op once the slice exists. */
  ensureProjectData: (project: Project) => void;
  /** Mirrors source's `makeDataSetterFor(pid, key)` (~lines 4497-4505): a
   * useState-setter-shaped writer scoped to one project's data slice. */
  getDataSetter: <K extends keyof ProjectDataSlice>(
    projectId: string,
    key: K,
  ) => (updater: ProjectDataUpdater<K>) => void;
  updateProject: (projectId: string, patch: Partial<Project>) => void;
  /** Mirrors source's `handleCreateProject` (~lines 4528-4547): appends a
   * brand-new project AND seeds its data slice in one go (so a freshly
   * created project's Documentation/Reports tabs aren't empty even before
   * anything is uploaded). `dataOverrides` lets the caller replace parts of
   * the lazily-generated slice (e.g. seeded `documents` from the wizard's
   * "Initial Files" step, an empty `reports` list) exactly like source did
   * with `{ ...makeProjectData(newProject), documents: seededDocs, reports: [] }`. */
  addProject: (project: Project, dataOverrides?: Partial<ProjectDataSlice>) => void;
  /** Undo counterpart of `addProject` -- mirrors source's toast-undo callback
   * on project creation (`setProjects((prev) => prev.filter(...))` +
   * deleting the data slice). */
  removeProject: (projectId: string) => void;
  /** Direct port of source's `bulkUpdateProjects(idsOrPairs, patch)`
   * (~lines 4460-4466): either `(ids[], patch)` to apply the SAME patch to
   * every id, or `(pairs[], undefined)` to apply each pair's own patch --
   * the latter is what `ProjectsTable`'s bulk-stage-change undo uses to
   * restore each row's PRIOR (possibly different) `statusKey`. */
  bulkUpdateProjects: (
    idsOrPairs: string[] | Array<{ id: string; patch: Partial<Project> }>,
    patch?: Partial<Project>,
  ) => void;
}

const ProjectDataCtx = createContext<ProjectDataContextValue | null>(null);

export function ProjectDataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [projectDataById, setProjectDataById] = useState<
    Record<string, ProjectDataSlice | undefined>
  >({});

  const ensureProjectData = useCallback((project: Project) => {
    setProjectDataById((prev) =>
      prev[project.id] ? prev : { ...prev, [project.id]: makeProjectData(project) },
    );
  }, []);

  const getDataSetter = useCallback(
    <K extends keyof ProjectDataSlice>(projectId: string, key: K) =>
      (updater: ProjectDataUpdater<K>) => {
        setProjectDataById((prev) => {
          const cur = prev[projectId];
          if (!cur) return prev;
          const nextVal =
            typeof updater === "function"
              ? (updater as (prev: ProjectDataSlice[K]) => ProjectDataSlice[K])(cur[key])
              : updater;
          return { ...prev, [projectId]: { ...cur, [key]: nextVal } };
        });
      },
    [],
  );

  const updateProject = useCallback((projectId: string, patch: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...patch } : p)));
  }, []);

  const addProject = useCallback((project: Project, dataOverrides?: Partial<ProjectDataSlice>) => {
    setProjects((prev) => [...prev, project]);
    setProjectDataById((prev) => ({
      ...prev,
      [project.id]: { ...makeProjectData(project), ...dataOverrides },
    }));
  }, []);

  const removeProject = useCallback((projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setProjectDataById((prev) => {
      const next = { ...prev };
      delete next[projectId];
      return next;
    });
  }, []);

  const bulkUpdateProjects = useCallback(
    (
      idsOrPairs: string[] | Array<{ id: string; patch: Partial<Project> }>,
      patch?: Partial<Project>,
    ) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (patch !== undefined) {
            return (idsOrPairs as string[]).includes(p.id) ? { ...p, ...patch } : p;
          }
          const pair = (idsOrPairs as Array<{ id: string; patch: Partial<Project> }>).find(
            (x) => x.id === p.id,
          );
          return pair ? { ...p, ...pair.patch } : p;
        }),
      );
    },
    [],
  );

  const value = useMemo<ProjectDataContextValue>(
    () => ({
      projects,
      projectDataById,
      ensureProjectData,
      getDataSetter,
      updateProject,
      addProject,
      removeProject,
      bulkUpdateProjects,
    }),
    [
      projects,
      projectDataById,
      ensureProjectData,
      getDataSetter,
      updateProject,
      addProject,
      removeProject,
      bulkUpdateProjects,
    ],
  );

  return <ProjectDataCtx.Provider value={value}>{children}</ProjectDataCtx.Provider>;
}

export function useProjectData(): ProjectDataContextValue {
  const ctx = useContext(ProjectDataCtx);
  if (!ctx) throw new Error("useProjectData must be used within a ProjectDataProvider");
  return ctx;
}
