import { useI18n } from "@/hooks/useI18n";
import { cx } from "@/lib/cx";
import "@/features/inbox/inbox.css";
import { Avatar } from "@/components/Avatar/Avatar";
import { Button } from "@/components/Button/Button";
import { AlertTriangle, Sparkles } from "@/components/Icon/icons";
import type { InboxMessage } from "@/features/inbox/types";

/**
 * Ported from REHUB WORK V8.html, script block 5, lines ~3100-3123.
 *
 * `onSpam` is nullable/optional -- `InboxTab` only wires it up for the
 * Inbox folder (Sent/Spam never show a "Move to Spam" action), matching
 * the source's `onSpam={folder === "inbox" ? onMoveToSpam : null}`.
 */
export interface EmailRowProps {
  message: InboxMessage;
  unread: boolean;
  onOpen: (message: InboxMessage) => void;
  onStart: (message: InboxMessage) => void;
  onSpam?: ((message: InboxMessage) => void) | null;
}

export function EmailRow({ message, unread, onOpen, onStart, onSpam }: EmailRowProps) {
  const { t } = useI18n();

  return (
    <div
      onClick={() => onOpen(message)}
      className={cx(
        "rh-inbox-row d-flex align-items-start justify-content-between gap-3",
        unread && "rh-inbox-row-unread",
      )}
    >
      <div className="d-flex align-items-start gap-2 rh-inbox-row-main">
        <Avatar
          initials={message.initials}
          className={cx(
            "rh-inbox-row-avatar",
            unread ? "rh-inbox-row-avatar-unread" : "rh-inbox-row-avatar-read",
          )}
        />
        <div className="rh-inbox-row-body">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <span className={cx("rh-inbox-row-from", unread && "rh-inbox-row-from-unread")}>
              {t(message.fromKey)}
            </span>
            {unread && <span className="rh-inbox-row-unread-dot rh-animate-pulse-dot" />}
            <span className="rh-inbox-row-meta">
              {t(message.companyKey)} · {t(message.receivedKey)}
            </span>
          </div>
          <div className={cx("rh-inbox-row-subject", unread && "rh-inbox-row-subject-unread")}>
            {t(message.subjectKey)}
          </div>
          <div className="rh-inbox-row-preview">{t(message.previewKey)}</div>
          <div className="rh-inbox-row-hint">{t("inbox.readHint")}</div>
        </div>
      </div>
      <div
        className="d-flex flex-column align-items-end gap-2 rh-inbox-row-actions"
        onClick={(e) => e.stopPropagation()}
      >
        {message.hasSubstitution && (
          <Button variant="primary" size="sm" onClick={() => onStart(message)}>
            <Sparkles size={14} /> {t("inbox.startAnalysis")}
          </Button>
        )}
        {onSpam && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSpam(message)}
            title={t("mail.moveToSpam")}
          >
            <AlertTriangle size={14} /> {t("mail.moveToSpam")}
          </Button>
        )}
      </div>
    </div>
  );
}
