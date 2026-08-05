import { useI18n } from "@/hooks/useI18n";
import { cx } from "@/lib/cx";
import { formatCurrency } from "@/lib/format";
import { Dialog, DialogHeader } from "@/components/Dialog/Dialog";
import { Card } from "@/components/Card/Card";
import { Button } from "@/components/Button/Button";
import { Alert, type AlertVariant } from "@/components/Alert/Alert";
import { AlertTriangle, Sparkles } from "@/components/Icon/icons";
import { getScenario } from "@/features/norms/constants/data";
import type { VerdictTone } from "@/features/norms/types";
import type { Project } from "@/features/projects";
import type { InboxMessage } from "@/features/inbox";
import "@/features/norms/norms.css";

/**
 * Ported from REHUB WORK V8.html, script block 1, ~lines 3029-3073.
 *
 * Compare-mode: side-by-side substitution requests for projects with 2+
 * simultaneous pending requests (the Lviv Water Treatment scenario).
 * Implemented as a regular `Dialog`, so Escape/focus-trap/Tab-cycling is
 * already handled by `Dialog`'s own `useFocusTrap` -- no separate
 * full-screen overlay logic is needed here, unlike `SubstitutionFlow`.
 */
export interface CompareSubstitutionsDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  messages: InboxMessage[];
  onOpenWizard: (message: InboxMessage) => void;
}

const VERDICT_ALERT_VARIANT: Record<VerdictTone, AlertVariant> = {
  critical: "red",
  amber: "amber",
  success: "green",
};

export function CompareSubstitutionsDialog({
  open,
  onClose,
  project,
  messages,
  onOpenWizard,
}: CompareSubstitutionsDialogProps) {
  const { t, locale } = useI18n();

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} size="xl">
      <DialogHeader
        title={t("compare.dialogTitle")}
        description={t("compare.dialogDesc")}
        onClose={onClose}
      />
      <div className="rh-compare-body">
        <div className={cx("rh-compare-grid", messages.length > 1 && "rh-compare-grid-2")}>
          {messages.map((m) => {
            const scenario = getScenario(project.id, m.scenarioKey);
            const variant = VERDICT_ALERT_VARIANT[scenario.verdict.tone] ?? "red";
            return (
              <Card key={m.id} className="rh-compare-card">
                <div>
                  <div className="rh-compare-card-company">{t(m.companyKey)}</div>
                  <div className="rh-compare-card-material">{t(scenario.materialShortNameKey)}</div>
                </div>
                <div className="rh-compare-card-change">
                  <span className="rh-compare-card-change-label">{t("compare.from")}:</span>{" "}
                  {t(scenario.fromMaterialKey)}
                  <br />
                  <span className="rh-compare-card-change-label">{t("compare.to")}:</span>{" "}
                  {t(scenario.toMaterialKey)}
                </div>
                <div className="rh-compare-card-cost">
                  <span className="rh-compare-card-cost-label">{t("compare.costImpact")}</span>
                  <span className="rh-compare-card-cost-value">
                    −{formatCurrency(Math.abs(scenario.costDelta), locale)}
                  </span>
                </div>
                <Alert variant={variant} className="rh-compare-card-verdict">
                  <AlertTriangle size={14} />
                  <div>
                    <div className="rh-compare-card-verdict-label">{t("compare.verdictLabel")}</div>
                    <div className="rh-compare-card-verdict-title">
                      {t(scenario.verdict.titleKey)}
                    </div>
                  </div>
                </Alert>
                <Button
                  variant="outline"
                  size="sm"
                  className="rh-compare-card-action"
                  onClick={() => onOpenWizard(m)}
                >
                  <Sparkles size={14} /> {t("compare.openWizard")}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
}
