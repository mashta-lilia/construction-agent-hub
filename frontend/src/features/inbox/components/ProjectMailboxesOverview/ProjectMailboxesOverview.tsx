import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import "@/features/inbox/inbox.css";
import i18n from "@/i18n";
import { Card } from "@/components/Card/Card";
import { Input } from "@/components/Input/Input";
import { Badge } from "@/components/Badge/Badge";
import { Search } from "@/components/Icon/icons";
import { getProjectEmail, type Project } from "@/features/projects";
import type { InboxMessage } from "@/features/inbox/types";
import { messageMatchesQuery } from "@/features/inbox/components/InboxTab/InboxTab";

/**
 * Ported from REHUB WORK V8.html, script block 12, lines ~4283-4340.
 *
 * Global "Project Mailboxes" page (Sidebar -> Mail). `projectDataById` is
 * the same per-project data map `Dashboard` builds lazily via
 * `makeProjectData` (see CLAUDE.md's data-model note) -- only the inbox
 * slice (`inboxMessages`/`sentMessages`/`spamMessages`) is read here, so
 * the prop is typed against that slice only rather than the full
 * per-project record (which also carries documents/reports/etc. owned by
 * other features).
 */
export interface ProjectMailData {
  inboxMessages?: InboxMessage[];
  sentMessages?: InboxMessage[];
  spamMessages?: InboxMessage[];
}

export interface ProjectMailboxesOverviewProps {
  projects: Project[];
  projectDataById: Record<string, ProjectMailData | undefined>;
  onOpenMailbox: (project: Project) => void;
}

export function ProjectMailboxesOverview({
  projects,
  projectDataById,
  onOpenMailbox,
}: ProjectMailboxesOverviewProps) {
  const { t } = useI18n();
  /* Search across ALL project mailboxes -- filters rows by project name,
     corporate email address, OR any message (subject/sender/body) inside
     that project's inbox, so typing a sender's name surfaces which
     project's mailbox contains it. */
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();

  const visibleProjects = projects.filter((p) => {
    if (!q) return true;
    if (t(p.nameKey).toLowerCase().includes(q)) return true;
    const nameEn = i18n.getFixedT("en")(p.nameKey);
    if (getProjectEmail(p, nameEn).toLowerCase().includes(q)) return true;
    const data = projectDataById[p.id];
    const allMessages = [
      ...(data?.inboxMessages ?? []),
      ...(data?.sentMessages ?? []),
      ...(data?.spamMessages ?? []),
    ];
    return allMessages.some((m) => messageMatchesQuery(m, q));
  });

  return (
    <div className="rh-inbox-overview-page">
      <div className="mb-4">
        <h1 className="rh-inbox-overview-title">{t("mail.overviewTitle")}</h1>
        <p className="rh-inbox-overview-subtitle">
          {t("mail.overviewSubtitle", { n: projects.length })}
        </p>
      </div>
      <div className="rh-inbox-search rh-inbox-overview-search">
        <Search size={14} className="rh-inbox-search-icon" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("mail.searchPlaceholder")}
          className="rh-inbox-search-input"
        />
      </div>
      <Card className="rh-inbox-card">
        <div className="rh-inbox-table-scroll">
          <table className="rh-inbox-table">
            <thead>
              <tr>
                <th>{t("col.name")}</th>
                <th>{t("mail.colAddress")}</th>
                <th className="rh-inbox-table-num">{t("mail.colUnread")}</th>
                <th className="rh-inbox-table-num">{t("mail.colTotal")}</th>
              </tr>
            </thead>
            <tbody>
              {visibleProjects.map((p) => {
                const data = projectDataById[p.id];
                const messages = data?.inboxMessages ?? [];
                const unread = messages.filter((m) => m.unread).length;
                const nameEn = i18n.getFixedT("en")(p.nameKey);
                return (
                  <tr key={p.id} onClick={() => onOpenMailbox(p)} className="rh-inbox-table-row">
                    <td className="rh-inbox-table-name">{t(p.nameKey)}</td>
                    <td className="rh-inbox-table-address">{getProjectEmail(p, nameEn)}</td>
                    <td className="rh-inbox-table-num">
                      {unread > 0 ? (
                        <Badge variant="blue">{unread}</Badge>
                      ) : (
                        <span className="rh-inbox-table-zero">0</span>
                      )}
                    </td>
                    <td className="rh-inbox-table-num rh-inbox-table-total">{messages.length}</td>
                  </tr>
                );
              })}
              {visibleProjects.length === 0 && (
                <tr>
                  <td colSpan={4} className="rh-inbox-table-empty">
                    {t("mail.noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
