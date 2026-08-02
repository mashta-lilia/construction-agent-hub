import { useI18n } from "@/hooks/useI18n";
import i18n from "@/i18n";
import "@/features/inbox/inbox.css";
import { ArrowLeft } from "@/components/Icon/icons";
import { getProjectEmail, type Project } from "@/features/projects";
import type { InboxMessage } from "@/features/inbox/types";
import { InboxTab } from "@/features/inbox/components/InboxTab/InboxTab";
import type { ManualRequestPayload } from "@/features/inbox/components/ManualRequestModal/ManualRequestModal";

/**
 * Ported from REHUB WORK V8.html, script block 12, lines ~4341-4356.
 *
 * Per-project mailbox inspection view reached by clicking a row in
 * `ProjectMailboxesOverview` -- reuses `InboxTab` exactly as
 * `ProjectDetail`'s Inbox tab does, keeping "Start substitution analysis"
 * and folders/search/move-to-spam wired the same way.
 */
export interface ProjectMailboxDetailProps {
  project: Project;
  messages: InboxMessage[];
  sentMessages?: InboxMessage[];
  spamMessages?: InboxMessage[];
  onBack: () => void;
  onStart: (message: InboxMessage) => void;
  onManualStart: (payload: ManualRequestPayload) => void;
  onMoveToSpam: (message: InboxMessage) => void;
}

export function ProjectMailboxDetail({
  project,
  messages,
  sentMessages,
  spamMessages,
  onBack,
  onStart,
  onManualStart,
  onMoveToSpam,
}: ProjectMailboxDetailProps) {
  const { t } = useI18n();
  const nameEn = i18n.getFixedT("en")(project.nameKey);

  return (
    <div className="rh-inbox-detail-page">
      <button onClick={onBack} className="rh-inbox-detail-back">
        <ArrowLeft size={14} /> {t("mail.backToOverview")}
      </button>
      <div className="mb-4">
        <h1 className="rh-inbox-overview-title">{t(project.nameKey)}</h1>
        <p className="rh-inbox-detail-address">{getProjectEmail(project, nameEn)}</p>
      </div>
      <InboxTab
        project={project}
        messages={messages}
        sentMessages={sentMessages}
        spamMessages={spamMessages}
        onStart={onStart}
        onManualStart={onManualStart}
        onMoveToSpam={onMoveToSpam}
      />
    </div>
  );
}
