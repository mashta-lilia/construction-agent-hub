import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/providers/ToastProvider";
import { useProjectData } from "@/providers/ProjectDataProvider";
import { ProjectMailboxDetail } from "@/features/inbox";
import type { InboxMessage } from "@/features/inbox";
import { ROUTES } from "@/routes/paths";

/**
 * Route entry point for `ROUTES.mailProject` ("/mail/:projectId") -- a
 * single project's mailbox inspection view, reached from `MailPage`.
 * Mirrors source's inline handlers on `Dashboard` (~lines 4592-4610):
 * `onStart`/`onManualStart` both send the engineer into that project's
 * Inbox tab (`ProjectDetail` isn't ported yet, so this currently lands on
 * `ProjectDetailPage`'s placeholder body with `tab="inbox"` in the URL --
 * a later pass wires the real tab); `onMoveToSpam` moves the message
 * between the inbox/spam slices with a toast + working Undo, exactly like
 * source's `toast(..., "success", () => { ...undo... })` pattern.
 */
export default function MailProjectPage() {
  const { t } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, projectDataById, ensureProjectData, getDataSetter } = useProjectData();
  const project = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (project) ensureProjectData(project);
  }, [project, ensureProjectData]);

  if (!project) {
    return <Navigate to={ROUTES.mail} replace />;
  }

  const data = projectDataById[project.id];

  const handleMoveToSpam = (message: InboxMessage) => {
    getDataSetter(project.id, "inboxMessages")((prev) => prev.filter((x) => x.id !== message.id));
    getDataSetter(project.id, "spamMessages")((prev) => [{ ...message, unread: false }, ...prev]);
    toast(t("toast.spamMoved"), "success", () => {
      getDataSetter(project.id, "spamMessages")((prev) => prev.filter((x) => x.id !== message.id));
      getDataSetter(project.id, "inboxMessages")((prev) => [message, ...prev]);
    });
  };

  return (
    <ProjectMailboxDetail
      project={project}
      messages={data?.inboxMessages ?? []}
      sentMessages={data?.sentMessages}
      spamMessages={data?.spamMessages}
      onBack={() => navigate(ROUTES.mail)}
      onStart={() => navigate(ROUTES.projectDetail(project.id, "inbox"))}
      onManualStart={() => navigate(ROUTES.projectDetail(project.id, "inbox"))}
      onMoveToSpam={handleMoveToSpam}
    />
  );
}
