import { cx } from "@/lib/cx";
import { useI18n } from "@/hooks/useI18n";
import { DialogHeader } from "@/components/Dialog/Dialog";
import { CardHeader, CardTitle } from "@/components/Card/Card";
import { ACTIVITY_FEED, type ActivityTone } from "./activityFeedData";
import "./GlobalActivityFeed.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 1942-1963).
 * Branches between `DialogHeader` (rendered inside a Dialog/Sheet
 * somewhere, i.e. `onClose` passed) and `CardHeader`/`CardTitle`
 * (full-page use, no `onClose`), matching source exactly.
 */
export interface GlobalActivityFeedProps {
  onClose?: () => void;
}

const TONE_CLASS: Record<ActivityTone, string> = {
  blue: "rh-activity-icon-blue",
  green: "rh-activity-icon-green",
  red: "rh-activity-icon-red",
  amber: "rh-activity-icon-amber",
  slate: "rh-activity-icon-slate",
};

export function GlobalActivityFeed({ onClose }: GlobalActivityFeedProps) {
  const { t } = useI18n();

  return (
    <div className="rh-activity-feed">
      {onClose ? (
        <DialogHeader title={t("activity.title")} onClose={onClose} />
      ) : (
        <CardHeader>
          <CardTitle>{t("activity.title")}</CardTitle>
        </CardHeader>
      )}
      <div className="rh-activity-feed-list">
        {ACTIVITY_FEED.length === 0 ? (
          <div className="rh-activity-feed-empty">{t("activity.empty")}</div>
        ) : (
          ACTIVITY_FEED.map((a) => {
            const IconCmp = a.icon;
            return (
              <div key={a.id} className="rh-activity-feed-item">
                <div className={cx("rh-activity-icon", TONE_CLASS[a.tone])}>
                  <IconCmp size={14} />
                </div>
                <div className="rh-activity-feed-item-text">
                  <div className="rh-activity-feed-item-desc">{t(a.textKey)}</div>
                  <div className="rh-activity-feed-item-time">{t(a.timeKey)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
