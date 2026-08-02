import { useI18n } from "@/hooks/useI18n";
import { cx } from "@/lib/cx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card/Card";
import type { AuditEntry } from "@/features/norms";
import "@/features/projects/projects.css";

/**
 * Ported from REHUB WORK V8.html, script block 1, ~lines 3074-3099.
 *
 * `AuditEntry` is defined in `features/norms/types` (not `features/projects`)
 * -- the audit trail is populated by `makeAudit()` (features/norms), which
 * already owns the substitution-scenario audit text; this component only
 * renders it for a project's Audit tab, so it imports the type through the
 * norms feature's barrel rather than redefining it here.
 */
export interface AuditTabProps {
  audit: AuditEntry[];
}

const TONE_DOT_CLASS: Record<AuditEntry["tone"], string> = {
  blue: "rh-audit-dot-blue",
  slate: "rh-audit-dot-slate",
};

export function AuditTab({ audit }: AuditTabProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("audit.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rh-audit-timeline">
          {audit.map((a, i) => (
            <div key={a.id} className="rh-audit-item">
              {i < audit.length - 1 && <div className="rh-audit-connector" />}
              <div className={cx("rh-audit-dot", TONE_DOT_CLASS[a.tone])} />
              <div className="rh-audit-item-body">
                <div className="rh-audit-item-head">
                  <span className="rh-audit-item-time">{a.time}</span>
                  <span className="rh-audit-item-date">{a.date}</span>
                </div>
                <div className="rh-audit-item-text">{t(a.textKey)}</div>
                <div className="rh-audit-item-who">
                  {t("audit.performer")}: {t(a.whoKey)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
