import { useI18n } from "@/hooks/useI18n";
import { cx } from "@/lib/cx";
import { Card } from "@/components/Card/Card";
import { Badge, type BadgeVariant } from "@/components/Badge/Badge";
import { Button } from "@/components/Button/Button";
import { GitCommitIcon, Layers } from "@/components/Icon/icons";
import type { RevisionEntry, RevisionStatusKey } from "@/features/norms/types";
import "@/features/norms/norms.css";

/**
 * Ported from REHUB WORK V8.html, script block 1, ~lines 3002-3028.
 */
export interface RevisionsTabProps {
  revisions: RevisionEntry[];
  onOpenSubstitution: (revision: RevisionEntry) => void;
  /** Compare-mode entry point: only surfaced when this project actually has
   * 2+ SIMULTANEOUS pending substitution requests (see
   * `SUBSTITUTION_SCENARIOS_EXTRA` / `makeRevisions`, features/norms). */
  onCompare?: () => void;
}

const STATUS_BADGE_VARIANT: Record<RevisionStatusKey, BadgeVariant> = {
  approved: "green",
  rejected: "default",
  pending: "amber",
};

export function RevisionsTab({ revisions, onOpenSubstitution, onCompare }: RevisionsTabProps) {
  const { t } = useI18n();
  const pendingSubCount = revisions.filter(
    (r) => r.isSubstitution && r.statusKey === "pending",
  ).length;

  return (
    <div className="rh-revisions-list">
      {pendingSubCount >= 2 && onCompare && (
        <Card className="rh-revisions-banner rh-animate-fade-in">
          <div className="rh-revisions-banner-text">
            <Layers size={16} /> {t("compare.requestsBanner", { n: pendingSubCount })}
          </div>
          <Button variant="primary" size="sm" onClick={onCompare}>
            <Layers size={14} /> {t("compare.openCompare")}
          </Button>
        </Card>
      )}
      {revisions.map((r) => {
        const authorText = r.authorKey
          ? t(r.authorKey)
          : r.authorSupplierFromKey
            ? t("norms.revision.supplierAuthorSuffix", { name: t(r.authorSupplierFromKey) })
            : "";
        return (
          <Card
            key={r.id}
            onClick={() => r.isSubstitution && onOpenSubstitution(r)}
            className={cx("rh-revisions-item", r.isSubstitution && "rh-revisions-item-clickable")}
          >
            <div className="rh-revisions-item-main">
              <div className="rh-revisions-item-icon">
                <GitCommitIcon size={16} />
              </div>
              <div>
                <div className="rh-revisions-item-title">{t(r.titleKey)}</div>
                <div className="rh-revisions-item-desc">{t(r.descKey)}</div>
                <div className="rh-revisions-item-meta">
                  {authorText} · {r.date}
                </div>
              </div>
            </div>
            <Badge variant={STATUS_BADGE_VARIANT[r.statusKey]}>{t(`rev.${r.statusKey}`)}</Badge>
          </Card>
        );
      })}
    </div>
  );
}
