import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import "@/features/inbox/inbox.css";
import { useToast } from "@/providers/ToastProvider";
import { cx } from "@/lib/cx";
import i18n from "@/i18n";
import { Card, CardHeader, CardTitle } from "@/components/Card/Card";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { PenLine, RefreshCw, Search } from "@/components/Icon/icons";
import type { Project } from "@/features/projects";
import type { InboxMessage } from "@/features/inbox/types";
import { EmailRow } from "@/features/inbox/components/EmailRow/EmailRow";
import { EmailReaderDialog } from "@/features/inbox/components/EmailReaderDialog/EmailReaderDialog";
import {
  ManualRequestModal,
  type ManualRequestPayload,
} from "@/features/inbox/components/ManualRequestModal/ManualRequestModal";

/**
 * Folder tab row shared by `ProjectDetail`'s Inbox tab and the global
 * `ProjectMailboxDetail` view. "inbox" (default) reads `messages` (minus
 * anything moved to spam), "sent" reads the sent-messages list populated
 * by the reply-dispatch flow (features/norms, via the composing parent),
 * "spam" reads messages moved there via the "Move to Spam" action.
 *
 * Ported from REHUB WORK V8.html, script block 5, lines ~3209-3283.
 */
export type MailFolderKey = "inbox" | "sent" | "spam";

const MAIL_FOLDERS: Array<{ key: MailFolderKey; labelKey: string }> = [
  { key: "inbox", labelKey: "mail.folderInbox" },
  { key: "sent", labelKey: "mail.folderSent" },
  { key: "spam", labelKey: "mail.folderSpam" },
];

/** Keys searched against, matching the source exactly -- `received` is
 * intentionally excluded, and so is the plain (untranslated) `email`
 * address, same as the original `messageMatchesQuery`. */
const SEARCHABLE_KEYS = ["fromKey", "companyKey", "subjectKey", "previewKey", "bodyKey"] as const;

/**
 * The source concatenated both the `en` and `uk` copies of every bilingual
 * field regardless of the UI's current locale, so a search hit in either
 * language always surfaces the message. Now that these fields are i18n
 * keys (not raw bilingual objects), that's replicated with two
 * locale-forced translators instead of the current-locale `t()`.
 */
export function messageMatchesQuery(message: InboxMessage, query: string): boolean {
  if (!query) return true;
  const fixedEn = i18n.getFixedT("en");
  const fixedUk = i18n.getFixedT("uk");
  const haystack = SEARCHABLE_KEYS.map(
    (field) => `${fixedEn(message[field])} ${fixedUk(message[field])}`,
  )
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export interface InboxTabProps {
  project: Project;
  messages: InboxMessage[];
  sentMessages?: InboxMessage[];
  spamMessages?: InboxMessage[];
  onStart: (message: InboxMessage) => void;
  onManualStart: (payload: ManualRequestPayload) => void;
  onMoveToSpam: (message: InboxMessage) => void;
}

export function InboxTab({
  messages,
  sentMessages,
  spamMessages,
  onStart,
  onManualStart,
  onMoveToSpam,
}: InboxTabProps) {
  const { t } = useI18n();
  const toast = useToast();
  const [manualOpen, setManualOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [reading, setReading] = useState<InboxMessage | null>(null);
  const [folder, setFolder] = useState<MailFolderKey>("inbox");
  const [search, setSearch] = useState("");

  const isUnread = (msg: InboxMessage) => !!msg.unread && !readIds.includes(msg.id);
  const openMessage = (msg: InboxMessage) => {
    setReadIds((prev) => (prev.includes(msg.id) ? prev : [...prev, msg.id]));
    setReading(msg);
  };
  const doFetch = () => {
    setFetching(true);
    setTimeout(() => {
      setFetching(false);
      toast(t("toast.inboxUpToDate"));
    }, 1100);
  };

  const sent = sentMessages ?? [];
  const spam = spamMessages ?? [];
  const folderMessages = folder === "sent" ? sent : folder === "spam" ? spam : messages;
  const folderLabelKey =
    folder === "sent"
      ? "mail.folderSent"
      : folder === "spam"
        ? "mail.folderSpam"
        : "mail.folderInbox";
  const q = search.trim().toLowerCase();
  const visibleMessages = folderMessages.filter((m) => messageMatchesQuery(m, q));
  const counts: Record<MailFolderKey, number> = {
    inbox: messages.length,
    sent: sent.length,
    spam: spam.length,
  };

  /* Mail is auto-provisioned per project -- there is no "not connected" empty
     state and no manual "Connect Mailbox" step; InboxTab always renders the
     connected inbox view, seeded from this project's own mock messages. */
  return (
    <div>
      <div className="mb-4 d-flex flex-wrap align-items-center gap-2">
        <Button variant="primary" size="sm" disabled={fetching} onClick={doFetch}>
          <RefreshCw size={14} className={cx(fetching && "rh-animate-spin")} /> {t("inbox.refresh")}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setManualOpen(true)}>
          <PenLine size={14} /> {t("inbox.manualEntry")}
        </Button>
      </div>
      <div className="mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="rh-inbox-folder-tabs">
          {MAIL_FOLDERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFolder(f.key)}
              className={cx(
                "rh-inbox-folder-tab",
                folder === f.key && "rh-inbox-folder-tab-active",
              )}
            >
              {t(f.labelKey)} <span className="rh-inbox-folder-count">{counts[f.key]}</span>
            </button>
          ))}
        </div>
        <div className="rh-inbox-search">
          <Search size={14} className="rh-inbox-search-icon" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("mail.searchPlaceholder")}
            className="rh-inbox-search-input"
          />
        </div>
      </div>
      <Card className="rh-inbox-card">
        <CardHeader className="d-flex align-items-center justify-content-between">
          <CardTitle>{t(folderLabelKey)}</CardTitle>
          <span className="rh-inbox-card-count">
            {visibleMessages.length ? t("inbox.messages", { n: visibleMessages.length }) : ""}
          </span>
        </CardHeader>
        {folderMessages.length > 0 ? (
          visibleMessages.length > 0 ? (
            <div className="rh-inbox-list">
              {visibleMessages.map((m) => (
                <EmailRow
                  key={m.id}
                  message={m}
                  unread={isUnread(m)}
                  onOpen={openMessage}
                  onStart={onStart}
                  onSpam={folder === "inbox" ? onMoveToSpam : null}
                />
              ))}
            </div>
          ) : (
            <div className="rh-inbox-empty">{t("mail.noResults")}</div>
          )
        ) : (
          <div className="rh-inbox-empty">{t("inbox.noMessages")}</div>
        )}
      </Card>
      <EmailReaderDialog
        message={reading}
        onClose={() => setReading(null)}
        onStart={(m) => {
          setReading(null);
          onStart(m);
        }}
        onSpam={
          folder === "inbox"
            ? (m) => {
                setReading(null);
                onMoveToSpam(m);
              }
            : null
        }
      />
      <ManualRequestModal
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        onStart={(payload) => {
          setManualOpen(false);
          onManualStart(payload);
        }}
      />
    </div>
  );
}
