import { useI18n } from "@/hooks/useI18n";
import { Dialog, DialogHeader } from "@/components/Dialog/Dialog";
import "@/features/inbox/inbox.css";
import { Avatar } from "@/components/Avatar/Avatar";
import { Button } from "@/components/Button/Button";
import { AlertTriangle, Sparkles } from "@/components/Icon/icons";
import type { InboxMessage } from "@/features/inbox/types";

/**
 * Ported from REHUB WORK V8.html, script block 5, lines ~3124-3148.
 *
 * `message` is nullable: `Dialog`'s `open` prop is driven off `!!message`,
 * same as the source (`<Dialog open={!!message} ...>`), so the reading
 * pane's content only needs to render once a message is actually set.
 */
export interface EmailReaderDialogProps {
  message: InboxMessage | null;
  onClose: () => void;
  onStart: (message: InboxMessage) => void;
  onSpam?: ((message: InboxMessage) => void) | null;
}

export function EmailReaderDialog({ message, onClose, onStart, onSpam }: EmailReaderDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={!!message} onClose={onClose} size="lg">
      {message && (
        <>
          <DialogHeader
            title={t(message.subjectKey)}
            description={t(message.companyKey)}
            onClose={onClose}
          />
          <div className="rh-inbox-reader-body">
            <div className="d-flex align-items-center gap-2 rh-inbox-reader-sender">
              <Avatar initials={message.initials} className="rh-inbox-reader-avatar" />
              <div className="rh-inbox-reader-sender-info">
                <div className="rh-inbox-reader-sender-name">{t(message.fromKey)}</div>
                <div className="rh-inbox-reader-sender-meta">
                  {message.email} · {t(message.receivedKey)}
                </div>
              </div>
            </div>
            <div className="rh-inbox-reader-content">{t(message.bodyKey)}</div>
          </div>
          <div className="d-flex justify-content-end gap-2 rh-inbox-reader-footer">
            {onSpam && (
              <Button variant="outline" onClick={() => onSpam(message)}>
                <AlertTriangle size={16} /> {t("mail.moveToSpam")}
              </Button>
            )}
            {message.hasSubstitution && (
              <Button variant="primary" onClick={() => onStart(message)}>
                <Sparkles size={16} /> {t("inbox.startAnalysis")}
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              {t("action.close")}
            </Button>
          </div>
        </>
      )}
    </Dialog>
  );
}
